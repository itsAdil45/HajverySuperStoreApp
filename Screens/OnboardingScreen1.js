import React from 'react';
import OnboardingItem from './OnboardingItem';

const OnboardingScreen1 = ({ navigation }) => {
    return (
        <OnboardingItem
            image={require('../assets/onboard1.png')}
            title="Buy Groceries Easily with Us"
            description="It is a long established fact that a reader will be distracted by the readable."
            onNext={() => navigation.navigate('Login')}
            onSkip={() => navigation.navigate('Login')}
            showSkip={true}
        />
    );
};

export default OnboardingScreen1;