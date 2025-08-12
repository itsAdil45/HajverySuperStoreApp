import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import useGet from "../hooks/useGet";
import appColors from "../colors/appColors";


export default function OrderDetail({ route }) {
    const { orderId } = route.params;
    const { data: orderData, loading: orderLoading, error: orderError, refetch } = useGet(`/orders/my/orders/${orderId}`);
    const [orderItems, setOrderItems] = useState([]);

    useEffect(() => {
        if (orderData) {
            setOrderItems(orderData);
        }
    }, [orderData]);

    const ProductItem = ({ item, index }) => {
        const { data: productDetail, loading: productLoading } = useGet(`/products/${item.product?._id}`);

        return (
            <View key={item._id || index} style={styles.itemCard}>
                <View style={styles.imageContainer}>
                    {productLoading ? (
                        <View style={[styles.productImage, styles.imagePlaceholder]}>
                            <ActivityIndicator size="small" color={appColors.Primary_Button} />
                        </View>
                    ) : (
                        <Image
                            source={{
                                uri: productDetail?.images?.[0] || 'https://via.placeholder.com/80x80?text=No+Image'
                            }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    )}
                </View>
                <View style={styles.itemDetails}>
                    <Text style={styles.productName}>{item.product?.name}</Text>
                    <Text style={styles.variantText}>Variant: {item.variantName}</Text>
                    <Text style={styles.quantityText}>Quantity: {item.quantity}</Text>
                    <Text style={styles.itemPrice}>Rs {item.price?.toFixed(2)}</Text>
                </View>
            </View>
        );
    };

    const DealItem = ({ item, index }) => {
        return (
            <View key={item._id || index} style={styles.dealCard}>
                <View style={styles.dealHeader}>
                    <Image
                        source={{
                            uri: item.deal?.bannerImage || 'https://via.placeholder.com/80x80?text=Deal'
                        }}
                        style={styles.dealBannerImage}
                        resizeMode="cover"
                    />
                    <View style={styles.dealHeaderDetails}>
                        <Text style={styles.dealTitle}>{item.deal?.title}</Text>
                        <Text style={styles.dealDiscount}>{item.deal?.discount}% OFF</Text>
                        <Text style={styles.dealQuantity}>Quantity: {item.quantity}</Text>
                        <Text style={styles.dealPrice}>Rs {item.dealPrice?.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Deal Products */}
                <Text style={styles.dealProductsTitle}>Deal includes:</Text>
                {item.dealProducts?.map((dealProduct, dpIndex) => (
                    <View key={dealProduct._id || dpIndex} style={styles.dealProductItem}>
                        <Image
                            source={{
                                uri: dealProduct.product?.images?.[0] || 'https://via.placeholder.com/50x50?text=No+Image'
                            }}
                            style={styles.dealProductImage}
                            resizeMode="cover"
                        />
                        <View style={styles.dealProductDetails}>
                            <Text style={styles.dealProductName}>{dealProduct.product?.name}</Text>
                            <Text style={styles.dealProductVariant}>Variant: {dealProduct.variantName}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const OrderItem = ({ item, index }) => {
        if (item.itemType === 'deal') {
            return <DealItem item={item} index={index} />;
        } else {
            return <ProductItem item={item} index={index} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return appColors.Success;
            case 'pending':
                return appColors.Accent_CTA;
            case 'cancelled':
                return appColors.Error;
            default:
                return appColors.Primary_Button;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (orderLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={appColors.Primary_Button} />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (orderError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading order details</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.headerCard}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderTitle}>Order Details</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderItems.status) }]}>
                        <Text style={styles.statusText}>{orderItems.status?.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={styles.orderId}>Order ID: {orderItems._id}</Text>
                <Text style={styles.orderDate}>Placed on {formatDate(orderItems.createdAt)}</Text>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Order Items ({orderItems.itemCount || 0})</Text>
                {orderItems.items?.map((item, index) => (
                    <OrderItem key={item._id || index} item={item} index={index} />
                ))}
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Payment Information</Text>
                <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Payment Method:</Text>
                    <Text style={styles.paymentValue}>
                        {orderItems.paymentMethod?.toUpperCase() || 'N/A'}
                    </Text>
                </View>
                {orderItems.paymentReceipt && (
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Receipt:</Text>
                        <Text style={styles.paymentValue}>Available</Text>
                    </View>
                )}
            </View>

            {/* Order Summary */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Order Summary</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>Rs {orderItems.subtotal?.toFixed(2)}</Text>
                </View>

                {orderItems.charges && (
                    <>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>Rs {orderItems.charges.delivery?.toFixed(2)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>VAT</Text>
                            <Text style={styles.summaryValue}>Rs {orderItems.charges.vat?.toFixed(2)}</Text>
                        </View>

                        {orderItems.charges.other > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Other Charges</Text>
                                <Text style={styles.summaryValue}>Rs {orderItems.charges.other?.toFixed(2)}</Text>
                            </View>
                        )}
                    </>
                )}

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>Rs {orderItems.total?.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                {/* {orderItems.status === 'completed' && (
                    <TouchableOpacity style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Reorder</Text>
                    </TouchableOpacity>
                )} */}

                <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Contact Support</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appColors.Background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appColors.Background,
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
        backgroundColor: appColors.Background,
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: appColors.Error,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: appColors.Primary_Button,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    headerCard: {
        backgroundColor: 'white',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: appColors.Text_Body,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    orderId: {
        fontSize: 14,
        color: appColors.Text_Body,
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
        color: '#666',
    },
    sectionCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: appColors.Text_Body,
        marginBottom: 16,
    },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: appColors.lightBg,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    imageContainer: {
        marginRight: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: appColors.Text_Body,
        marginBottom: 4,
    },
    variantText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    quantityText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: appColors.Primary_Button,
    },
    // Deal styles
    dealCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: appColors.Accent_CTA,
    },
    dealHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    dealBannerImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    dealHeaderDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    dealTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: appColors.Text_Body,
        textTransform: 'capitalize',
    },
    dealDiscount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: appColors.Success,
        backgroundColor: appColors.lightBg,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    dealQuantity: {
        fontSize: 14,
        color: '#666',
    },
    dealPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: appColors.Accent_CTA,
    },
    dealProductsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: appColors.Text_Body,
        marginBottom: 8,
    },
    dealProductItem: {
        flexDirection: 'row',
        backgroundColor: appColors.lightBg,
        borderRadius: 6,
        padding: 8,
        marginBottom: 6,
    },
    dealProductImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
    },
    dealProductDetails: {
        flex: 1,
        marginLeft: 8,
        justifyContent: 'center',
    },
    dealProductName: {
        fontSize: 14,
        fontWeight: '500',
        color: appColors.Text_Body,
    },
    dealProductVariant: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 16,
        color: appColors.Text_Body,
    },
    paymentValue: {
        fontSize: 16,
        fontWeight: '600',
        color: appColors.Text_Body,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        color: appColors.Text_Body,
    },
    summaryValue: {
        fontSize: 16,
        color: appColors.Text_Body,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: appColors.Text_Body,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: appColors.Primary_Button,
    },
    actionContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    primaryButton: {
        backgroundColor: appColors.Primary_Button,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: appColors.Primary_Button,
    },
    secondaryButtonText: {
        color: appColors.Primary_Button,
        fontSize: 16,
        fontWeight: 'bold',
    },
});