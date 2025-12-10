import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface HelpTooltipProps {
    title: string;
    tips: string[];
    sectionId?: string;
}

export function HelpTooltip({ title, tips, sectionId }: HelpTooltipProps) {
    const [visible, setVisible] = useState(false);

    const handleViewFullHelp = () => {
        setVisible(false);
        router.push('/help');
    };

    return (
        <>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Ionicons name="help-circle-outline" size={24} color="#8B2332" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.tooltipContainer}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Ionicons name="help-circle" size={24} color="#8B2332" />
                                <Text style={styles.title}>{title}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color="#7f8c8d" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {tips.map((tip, index) => (
                                <View key={index} style={styles.tipRow}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.fullHelpButton}
                            onPress={handleViewFullHelp}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.fullHelpText}>View Full Help</Text>
                            <Ionicons name="arrow-forward" size={18} color="#8B2332" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        padding: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    tooltipContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c3e50',
        flex: 1,
    },
    content: {
        padding: 16,
        maxHeight: 300,
    },
    tipRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 16,
        color: '#8B2332',
        marginRight: 8,
        fontWeight: '700',
    },
    tipText: {
        fontSize: 15,
        color: '#34495e',
        lineHeight: 22,
        flex: 1,
    },
    fullHelpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        margin: 16,
        marginTop: 8,
        backgroundColor: '#f8e5e8',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#8B2332',
    },
    fullHelpText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B2332',
    },
});
