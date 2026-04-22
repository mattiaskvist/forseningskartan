import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LanguageCode } from '../utils/translations';

interface LanguageState {
    currentLanguage: LanguageCode;
}

const initialState: LanguageState = {
    currentLanguage: 'en',
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action: PayloadAction<LanguageCode>) => {
            state.currentLanguage = action.payload;
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;