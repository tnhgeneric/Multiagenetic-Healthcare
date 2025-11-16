import { Stack } from 'expo-router';

export default function PatientProfileLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="symptomCheck"
                options={{
                    title: 'Symptom Checker',
                    headerShown: true,
                }}
            />
        </Stack>
    );
}