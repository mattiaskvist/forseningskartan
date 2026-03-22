# GTFS Aggregation Infrastructure (Pulumi GCP Go)

This Pulumi project provisions the cloud infrastructure for the GTFS Aggregation service on Google Cloud Platform (GCP). It deploys a containerized Go application as a serverless scheduled task using Cloud Run Jobs and Cloud Scheduler.

The infrastructure is written in Go and emphasizes security by utilizing dedicated Service Accounts with the principle of least privilege, Google Cloud Secret Manager for API keys, and Workload Identity Federation for CI/CD.

## Architecture & Resources

This stack provisions the following resources in the `forseningskartan` project:

- Cloud Run Job (`aggregation-cron-job`): A serverless compute job that executes the Dockerized GTFS aggregator. It securely mounts secrets at runtime and is protected from accidental deletion.

- Cloud Scheduler (`daily-trigger`): A cron trigger configured to securely wake up and execute the Cloud Run Job on a set schedule.

- Runner Service Account (`aggregation-cron-runner`): The identity assumed by the Go application while running. It is explicitly granted access to:

   - Firestore/Datastore (`roles/datastore.user`)

   - Secret Manager (`roles/secretmanager.secretAccessor`)

- Invoker Service Account (`aggregation-cron-scheduler`): The identity used by Cloud Scheduler to trigger the job (`roles/run.invoker`).

## Prerequisites

To run this project locally or via CI/CD, you need:

- Go 1.26 or later

- Pulumi CLI installed

- Google Cloud CLI (gcloud) installed and authenticated

- A custom Pulumi state bucket created in GCP (e.g., `gs://forseningskartan-pulumi-state`)

- An Artifact Registry repository for Docker images (e.g., `cron-repo`)

## State Management & Authentication

This project does **not** use the managed Pulumi Service. State is stored securely in a self-managed Google Cloud Storage bucket.

Before running any Pulumi commands locally, you must log into the custom backend:

```bash
# Ensure you are authenticated with Google Cloud locally
gcloud auth application-default login

# Tell Pulumi to use the GCS bucket for state
pulumi login gs://forseningskartan-pulumi-state
```

*Note: You will be prompted for the Pulumi state passphrase to decrypt the stack*

## Configuration

The following Pulumi configuration values are used in this stack:

| Name | Description | Example |
|------|-------------|---------|
| `gcp:project` | The GCP project ID where resources will be provisioned | `forseningskartan` |
| `gcp:region` | The GCP region for Cloud Run and Scheduler | `europe-west1` |
| `dockerImage` | The fully qualified Artifact Registry image URL | `europe-west1-docker.pkg.dev/...:latest` |

In CI/CD, the `dockerImage` configuration is injected dynamically using the GitHub commit SHA to ensure the infrastructure always points to the newly built container.

## Deployment

### Automated via CI/CD

This infrastructure is automatically deployed via GitHub Actions. Pushing to the `main` branch will:

1. Build the Go application into a Docker container.

2. Push the container to GCP Artifact Registry.

3. Authenticate to GCP using Workload Identity Federation.

4. Run `pulumi up` to update the Cloud Run Job with the new image tag.

### Manual / Local Deployment

If you need to test infrastructure changes locally:

1. Log into the Pulumi state bucket (see above).

2. Set a temporary docker image (if you haven't built one yet):

```bash
pulumi config set dockerImage alpine:latest
```

3. Preview the changes:

```bash
pulumi preview
```

4. Deploy the stack:

```bash
pulumi up
```

