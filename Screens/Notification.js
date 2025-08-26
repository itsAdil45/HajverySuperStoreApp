import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons'

import useGet from '../hooks/useGet';
import { useEffect, useState } from 'react';

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    useAnimatedScrollHandler
} from 'react-native-reanimated';
import appColors from '../colors/appColors';

const { width, height } = Dimensions.get('window');

export default function Notification() {
    const { data: homeConfigData, loading: homeConfigLoading, error: homeConfigError, refetch: refetchHomeConfig } = useGet('/home-config/daily-message');
    const [refreshing, setRefreshing] = useState(false);
    const scrollY = useSharedValue(0);
    const [homeConfig, setHomeConfig] = useState(null);

    // const scrollHandler = useAnimatedScrollHandler({
    //     onScroll: (event) => {
    //         scrollY.value = event.contentOffset.y;
    //     },
    // });
    useEffect(() => {
        if (homeConfigData) {
            setHomeConfig(homeConfigData[0].message);
        }
    }, [homeConfigData]);



    const onRefresh = async () => {
        setRefreshing(true);
        await refetchHomeConfig();
        setRefreshing(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderDailyMessage = () => {
        if (homeConfigLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={appColors.Primary_Button} />
                    <Text style={styles.loadingText}>Loading daily message...</Text>
                </View>
            );
        }

        if (homeConfigError) {
            return (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color={appColors.Error} />
                    <Text style={styles.errorText}>Failed to load daily message</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refetchHomeConfig}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!homeConfig) {
            return (
                <View style={styles.emptyContainer}>
                    <Feather name="message-circle" size={48} color={appColors.Text_Body} />
                    <Text style={styles.emptyText}>No daily message available</Text>
                </View>
            );
        }

        const message = homeConfig;
        const messageParts = message.split('\n\n');
        const hadithText = messageParts[0];
        const gradeInfo = messageParts.find(part => part.startsWith('Grade:'));
        const sourceInfo = messageParts.find(part => part.startsWith('Source:'));
        const arabicText = messageParts.find(part => /[\u0600-\u06FF]/.test(part));

        return (

            <View style={styles.messageContainer}>
                {/* Date Header */}
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={20} color={appColors.Primary_Button} />
                    <Text style={styles.dateText}>{formatDate(Date.now())}</Text>
                </View>

                {/* Main Hadith Text */}
                <View style={styles.hadithContainer}>
                    <View style={styles.hadithHeader}>
                        <MaterialIcons name="format-quote" size={24} color={appColors.Primary_Button} />
                        <Text style={styles.hadithLabel}>Daily Hadith</Text>
                    </View>
                    <Text style={styles.hadithText}>{hadithText}</Text>
                </View>

                {/* Arabic Text */}
                {arabicText && (
                    <View style={styles.arabicContainer}>
                        <Text style={styles.arabicText}>{arabicText}</Text>
                    </View>
                )}

                {/* Authentication Info */}
                <View style={styles.infoContainer}>
                    {gradeInfo && (
                        <View style={styles.infoItem}>
                            <MaterialIcons name="verified" size={18} color={appColors.Success} />
                            <Text style={styles.infoText}>{gradeInfo}</Text>
                        </View>
                    )}

                    {sourceInfo && (
                        <View style={styles.infoItem}>
                            <MaterialIcons name="library-books" size={18} color={appColors.Primary_Button} />
                            <Text style={styles.infoText}>{sourceInfo}</Text>
                        </View>
                    )}
                </View>

            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header]}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Daily Message</Text>
                        <Text style={styles.headerSubtitle}>Islamic wisdom for today</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color={appColors.Primary_Button} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                // onScroll={scrollHandler}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[appColors.Primary_Button]}
                        tintColor={appColors.Primary_Button}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {renderDailyMessage()}


            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.Background,
    },
    header: {
        backgroundColor: 'white',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: appColors.lightBg,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: appColors.Text_Body,
    },
    headerSubtitle: {
        fontSize: 14,
        color: appColors.Primary_Button,
        marginTop: 2,
    },
    notificationButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: appColors.lightBg,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: appColors.Text_Body,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 100,
    },
    errorText: {
        fontSize: 16,
        color: appColors.Error,
        marginTop: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: appColors.Primary_Button,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: appColors.Text_Body,
        marginTop: 16,
        textAlign: 'center',
    },
    messageContainer: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: appColors.lightBg,
    },
    dateText: {
        fontSize: 16,
        color: appColors.Text_Body,
        marginLeft: 8,
        fontWeight: '500',
    },
    hadithContainer: {
        marginBottom: 20,
    },
    hadithHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    hadithLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: appColors.Primary_Button,
        marginLeft: 8,
    },
    hadithText: {
        fontSize: 16,
        lineHeight: 24,
        color: appColors.Text_Body,
        textAlign: 'left',
    },
    arabicContainer: {
        backgroundColor: appColors.lightBg,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderRightWidth: 4,
        borderRightColor: appColors.Primary_Button,
    },
    arabicText: {
        fontSize: 18,
        lineHeight: 28,
        color: appColors.Text_Body,
        textAlign: 'right',
        fontFamily: 'System', // You might want to use an Arabic font
    },
    infoContainer: {
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: appColors.Text_Body,
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: appColors.lightBg,
    },
    actionButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: appColors.lightBg,
        minWidth: 80,
    },
    actionButtonText: {
        fontSize: 12,
        color: appColors.Primary_Button,
        marginTop: 4,
        fontWeight: '500',
    },
    additionalSection: {
        margin: 20,
        marginTop: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: appColors.Text_Body,
        marginBottom: 16,
    },
    settingItem: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: appColors.Text_Body,
    },
    settingSubtitle: {
        fontSize: 14,
        color: appColors.Primary_Button,
        marginTop: 2,
    },
});