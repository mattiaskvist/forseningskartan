package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/cloudrunv2"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/cloudscheduler"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/projects"
	"github.com/pulumi/pulumi-gcp/sdk/v8/go/gcp/serviceaccount"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Load configuration
		conf := config.New(ctx, "")
		dockerImage := conf.Require("dockerImage")
		projectID := "forseningskartan"
		location := "europe-west1"

		// 1. Service Account for the Go application to execute as
		jobRunnerSa, err := serviceaccount.NewAccount(ctx, "job-runner-sa", &serviceaccount.AccountArgs{
			AccountId:   pulumi.String("aggregation-cron-runner"),
			DisplayName: pulumi.String("Cloud Run Job Runner"),
		})
		if err != nil {
			return err
		}

		// Grant the Service Account permission to read/write to Firestore
		_, err = projects.NewIAMMember(ctx, "firestore-access", &projects.IAMMemberArgs{
			Project: pulumi.String(projectID),
			Role:    pulumi.String("roles/datastore.user"),
			Member:  pulumi.Sprintf("serviceAccount:%s", jobRunnerSa.Email),
		})
		if err != nil {
			return err
		}

		// Grant the Service Account permission to read from Secret Manager
		_, err = projects.NewIAMMember(ctx, "secret-accessor", &projects.IAMMemberArgs{
			Project: pulumi.String(projectID),
			Role:    pulumi.String("roles/secretmanager.secretAccessor"),
			Member:  pulumi.Sprintf("serviceAccount:%s", jobRunnerSa.Email),
		})
		if err != nil {
			return err
		}

		// 2. The Cloud Run Job
		goCronJob, err := cloudrunv2.NewJob(ctx, "aggregation-cron-job", &cloudrunv2.JobArgs{
			Location:           pulumi.String(location),
			DeletionProtection: pulumi.Bool(false),
			Template: &cloudrunv2.JobTemplateArgs{
				Template: &cloudrunv2.JobTemplateTemplateArgs{
					Containers: cloudrunv2.JobTemplateTemplateContainerArray{
						&cloudrunv2.JobTemplateTemplateContainerArgs{
							Image: pulumi.String(dockerImage),
							Resources: &cloudrunv2.JobTemplateTemplateContainerResourcesArgs{
								Limits: pulumi.StringMap{
									"cpu":    pulumi.String("1"),
									"memory": pulumi.String("4Gi"),
								},
							},
							Envs: cloudrunv2.JobTemplateTemplateContainerEnvArray{
								&cloudrunv2.JobTemplateTemplateContainerEnvArgs{
									Name:  pulumi.String("FIRESTORE_PROJECT"),
									Value: pulumi.String(projectID),
								},
								&cloudrunv2.JobTemplateTemplateContainerEnvArgs{
									Name: pulumi.String("API_KEY"),
									ValueSource: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceArgs{
										SecretKeyRef: &cloudrunv2.JobTemplateTemplateContainerEnvValueSourceSecretKeyRefArgs{
											Secret:  pulumi.String("aggregator-api-key"),
											Version: pulumi.String("latest"),
										},
									},
								},
							},
						},
					},
					ServiceAccount: jobRunnerSa.Email,
				},
			},
		})
		if err != nil {
			return err
		}

		// 3. Service Account for Cloud Scheduler to securely trigger the job
		schedulerSa, err := serviceaccount.NewAccount(ctx, "scheduler-sa", &serviceaccount.AccountArgs{
			AccountId:   pulumi.String("aggregation-cron-scheduler"),
			DisplayName: pulumi.String("Cloud Scheduler Invoker"),
		})
		if err != nil {
			return err
		}

		// Grant the Scheduler SA permission to invoke this specific Cloud Run Job
		invokerBinding, err := cloudrunv2.NewJobIamMember(ctx, "scheduler-invoker-binding", &cloudrunv2.JobIamMemberArgs{
			Project:  goCronJob.Project,
			Location: goCronJob.Location,
			Name:     goCronJob.Name,
			Role:     pulumi.String("roles/run.invoker"),
			Member:   pulumi.Sprintf("serviceAccount:%s", schedulerSa.Email),
		})
		if err != nil {
			return err
		}

		// 4. The Cloud Scheduler Trigger
		_, err = cloudscheduler.NewJob(ctx, "daily-trigger", &cloudscheduler.JobArgs{
			Region:   pulumi.String(location),
			Schedule: pulumi.String("0 6,7,8,9 * * *"),  // Runs at minute 0 past hours 6, 7, 8, and 9 every day
			TimeZone: pulumi.String("Europe/Stockholm"), // Ensures it uses Swedish local time
			HttpTarget: &cloudscheduler.JobHttpTargetArgs{
				HttpMethod: pulumi.String("POST"),
				Uri:        pulumi.Sprintf("https://run.googleapis.com/v2/projects/%s/locations/%s/jobs/%s:run", goCronJob.Project, goCronJob.Location, goCronJob.Name),
				OauthToken: &cloudscheduler.JobHttpTargetOauthTokenArgs{
					ServiceAccountEmail: schedulerSa.Email,
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{invokerBinding}))
		if err != nil {
			return err
		}

		return nil
	})
}
