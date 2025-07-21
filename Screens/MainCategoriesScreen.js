import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import useGet from '../hooks/useGet';

const MainCategoriesScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);

    // Construct API URL with applied search query
    const apiUrl = appliedSearchQuery.trim()
        ? `/categories/all_main?search=${encodeURIComponent(appliedSearchQuery.trim())}`
        : '/categories/all_main';

    const { data, loading, error, refetch } = useGet(apiUrl);

    useEffect(() => {
        if (data && data.categories) {
            setCategories(data.categories);
        }
    }, [data]);

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const performSearch = () => {
        setAppliedSearchQuery(searchQuery);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setAppliedSearchQuery('');
    };

    const renderCategory = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate("CategoryProducts", { mainCategoryID: item._id })}
        >
            <Image source={{ uri: item.icon }} style={styles.categoryImage} />
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryDescription}>{item.description || 'Explore products'}</Text>
        </TouchableOpacity>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Feather name="search" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
                {appliedSearchQuery.trim() ? `No categories found for "${appliedSearchQuery}"` : 'No categories available'}
            </Text>
            {appliedSearchQuery.trim() && (
                <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                    <Text style={styles.clearButtonText}>Clear Search</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="chevron-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Categories</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="chevron-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Categories</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={60} color="#ff4444" />
                    <Text style={styles.errorText}>Failed to load categories</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Categories</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Feather name="search" size={18} color="#aaa" />
                    <TextInput
                        placeholder="Search categories..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        onSubmitEditing={performSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Feather name="x" size={18} color="#aaa" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={performSearch}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Feather name="search" size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Categories List */}
            <FlatList
                data={categories}
                keyExtractor={(item) => item._id}
                renderItem={renderCategory}
                numColumns={2}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyComponent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        gap: 12,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#000',
    },
    searchButton: {
        backgroundColor: '#007bff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
    },
    listContainer: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    categoryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        width: '48%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    categoryImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#007bff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    clearButton: {
        marginTop: 16,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    clearButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default MainCategoriesScreen;