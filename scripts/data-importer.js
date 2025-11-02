// Data Importer for Lost & Found Items
class DataImporter {
    constructor() {
        this.isImported = false;
    }

    // Check if data already exists to avoid duplicates
    async checkExistingData() {
        try {
            const snapshot = await db.collection('reports').limit(1).get();
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking existing data:', error);
            return false;
        }
    }

    // Import sample data from CSV (converted to JSON)
    async importSampleData() {
        if (!auth.currentUser) {
            console.log('User not authenticated, skipping data import');
            return;
        }

        // Check if data already exists
        const hasData = await this.checkExistingData();
        if (hasData) {
            console.log('Data already exists, skipping import');
            return;
        }

        try {
            console.log('Starting data import...');
            
            const sampleItems = this.getSampleData();
            let importedCount = 0;

            for (const item of sampleItems) {
                try {
                    await db.collection('reports').add({
                        ...item,
                        reporterId: auth.currentUser.email,
                        reporterUid: auth.currentUser.uid,
                        isLost: false,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        mlAnalysis: this.generateMLAnalysis(item.category)
                    });
                    importedCount++;
                    console.log(`Imported: ${item.itemName}`);
                } catch (error) {
                    console.error(`Failed to import ${item.itemName}:`, error);
                }
            }

            console.log(`Successfully imported ${importedCount} sample items`);
            
            // Show success message
            this.showImportNotification(importedCount);
            
        } catch (error) {
            console.error('Data import failed:', error);
        }
    }

    // Sample data (from our CSV)
    getSampleData() {
        return [
            {
                itemName: "Water Bottle",
                description: "Blue stainless steel water bottle, 500ml capacity",
                location: "Library, Study Area 3",
                date: "2024-01-15",
                imageURL: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400",
                category: "water_bottle",
                contactName: "John Smith",
                contactEmail: "john.smith@email.com",
                contactPhone: "+1234567890",
                contactMessage: "Available for pickup at library front desk"
            },
            {
                itemName: "Wedding Ring",
                description: "Gold wedding band with small diamond, size 7",
                location: "Park, Near playground",
                date: "2024-01-14",
                imageURL: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
                category: "jewelry",
                contactName: "Sarah Johnson",
                contactEmail: "sarah.j@email.com",
                contactPhone: "+1234567891",
                contactMessage: "Very sentimental item, reward offered"
            },
            {
                itemName: "Smartphone",
                description: "Black iPhone 13 with blue case",
                location: "Cafeteria, Table near window",
                date: "2024-01-16",
                imageURL: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
                category: "phone",
                contactName: "Mike Davis",
                contactEmail: "mike.davis@email.com",
                contactPhone: "+1234567892",
                contactMessage: "Please contact immediately"
            },
            {
                itemName: "Backpack",
                description: "Black JanSport backpack with books",
                location: "Bus Stop 42",
                date: "2024-01-13",
                imageURL: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
                category: "bag",
                contactName: "Emily Wilson",
                contactEmail: "emily.w@email.com",
                contactPhone: "",
                contactMessage: "Contains textbooks and laptop"
            },
            {
                itemName: "Keys",
                description: "Keychain with car key and 3 house keys",
                location: "Parking Lot B, Level 2",
                date: "2024-01-17",
                imageURL: "https://images.unsplash.com/photo-1594736797933-d0401ba94693?w=400",
                category: "keys",
                contactName: "David Brown",
                contactEmail: "david.b@email.com",
                contactPhone: "+1234567893",
                contactMessage: "Keychain has a small teddy bear"
            },
            {
                itemName: "Glasses",
                description: "Black rectangular reading glasses",
                location: "Gym, Locker room",
                date: "2024-01-12",
                imageURL: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400",
                category: "glasses",
                contactName: "Lisa Garcia",
                contactEmail: "lisa.g@email.com",
                contactPhone: "+1234567894",
                contactMessage: "Prescription glasses in black case"
            },
            {
                itemName: "Wallet",
                description: "Brown leather wallet with cards",
                location: "Shopping Mall, Food Court",
                date: "2024-01-18",
                imageURL: "https://images.unsplash.com/photo-1556740734-7f3a7d7f0f9e?w=400",
                category: "wallet",
                contactName: "Robert Miller",
                contactEmail: "robert.m@email.com",
                contactPhone: "+1234567895",
                contactMessage: "Contains ID and credit cards"
            },
            {
                itemName: "Book",
                description: "Chemistry textbook with highlighted pages",
                location: "Classroom 204",
                date: "2024-01-11",
                imageURL: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
                category: "book",
                contactName: "Jennifer Lee",
                contactEmail: "jennifer.l@email.com",
                contactPhone: "",
                contactMessage: "Name written on first page"
            },
            {
                itemName: "Headphones",
                description: "White wireless headphones with case",
                location: "Train Station, Platform 3",
                date: "2024-01-19",
                imageURL: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                category: "headphones",
                contactName: "Kevin Taylor",
                contactEmail: "kevin.t@email.com",
                contactPhone: "+1234567896",
                contactMessage: "Bose headphones in charging case"
            },
            {
                itemName: "Watch",
                description: "Silver analog watch with leather strap",
                location: "Restaurant, Bathroom",
                date: "2024-01-10",
                imageURL: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400",
                category: "watch",
                contactName: "Amanda Clark",
                contactEmail: "amanda.c@email.com",
                contactPhone: "+1234567897",
                contactMessage: "Fossil brand, sentimental value"
            }
        ];
    }

    // Generate ML analysis based on category
    generateMLAnalysis(category) {
        const confidence = 85 + Math.floor(Math.random() * 15); // 85-99%
        
        const categoryMap = {
            'water_bottle': [{ label: 'water_bottle', confidence: confidence, originalClass: 'bottle' }],
            'jewelry': [{ label: 'jewelry', confidence: confidence, originalClass: 'ring' }],
            'phone': [{ label: 'phone', confidence: confidence, originalClass: 'cellular telephone' }],
            'bag': [{ label: 'bag', confidence: confidence, originalClass: 'backpack' }],
            'keys': [{ label: 'keys', confidence: confidence, originalClass: 'key' }],
            'glasses': [{ label: 'glasses', confidence: confidence, originalClass: 'eyeglasses' }],
            'wallet': [{ label: 'wallet', confidence: confidence, originalClass: 'wallet' }],
            'book': [{ label: 'book', confidence: confidence, originalClass: 'book' }],
            'headphones': [{ label: 'headphones', confidence: confidence, originalClass: 'headphones' }],
            'watch': [{ label: 'watch', confidence: confidence, originalClass: 'wristwatch' }]
        };

        return {
            predictions: categoryMap[category] || [{ label: 'personal_item', confidence: 75, originalClass: 'general item' }],
            description: `AI detected ${category} with ${confidence}% confidence`,
            timestamp: new Date().toISOString()
        };
    }

    // Show import notification
    showImportNotification(count) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `
            <strong>Sample Data Imported!</strong><br>
            ${count} items added to the database.
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Manual import function (for admin use)
    async manualImport() {
        if (confirm('Import sample lost items data? This will add 10 sample items to the database.')) {
            await this.importSampleData();
        }
    }
}

// Initialize the data importer
const dataImporter = new DataImporter();

// Auto-import when user logs in (only once)
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (user && !user.isAnonymous) {
            // Wait a bit for Firebase to initialize, then import
            setTimeout(() => {
                dataImporter.importSampleData();
            }, 2000);
        }
    });
}