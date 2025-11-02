// ML Image Classification System
class MobileNetClassifier {
    constructor() {
        this.model = null;
        this.isLoaded = false;
        this.categoryMapping = {
            // Phones & Electronics
            'cellular telephone': 'phone',
            'cellphone': 'phone', 
            'mobile phone': 'phone',
            'iPhone': 'phone',
            'smartphone': 'phone',
            'laptop': 'laptop',
            'notebook': 'laptop',
            'computer': 'laptop',
            'iPod': 'electronics',
            'tablet': 'electronics',
            'iPad': 'electronics',
            
            // Bags & Wallets
            'wallet': 'wallet',
            'purse': 'wallet',
            'backpack': 'bag',
            'bag': 'bag',
            'handbag': 'bag',
            'briefcase': 'bag',
            'suitcase': 'bag',
            
            // Keys & Accessories
            'key': 'keys',
            'keychain': 'keys',
            'lock': 'keys',
            
            // Books & Documents
            'book': 'book',
            'notebook': 'book',
            'booklet': 'book',
            'envelope': 'documents',
            'folder': 'documents',
            
            // Personal Items
            'water bottle': 'water_bottle',
            'bottle': 'water_bottle',
            'headphones': 'headphones',
            'earphone': 'headphones',
            'eyeglasses': 'glasses',
            'sunglasses': 'glasses',
            'jacket': 'jacket',
            'coat': 'jacket',
            'umbrella': 'umbrella',
            'charger': 'charger',
            'powerbank': 'charger',
            'watch': 'watch',
            'wristwatch': 'watch',
            
            // Jewelry
            'necklace': 'jewelry',
            'bracelet': 'jewelry',
            'ring': 'jewelry',
            'earring': 'jewelry'
        };
    }

    // Load MobileNet model
    async loadModel() {
        try {
            console.log('Loading MobileNet model...');
            this.model = await mobilenet.load({
                version: 2,
                alpha: 1.0
            });
            this.isLoaded = true;
            console.log('MobileNet model loaded successfully');
        } catch (error) {
            console.error('Error loading MobileNet:', error);
            this.isLoaded = false;
        }
    }

    // Classify image
    async classifyImage(imageElement) {
        if (!this.isLoaded) {
            await this.loadModel();
        }

        if (!this.model) {
            return this.fallbackClassification();
        }

        try {
            // Get predictions from MobileNet
            const predictions = await this.model.classify(imageElement);
            
            // Map to our categories and filter relevant items
            const mappedPredictions = this.mapToLostItemCategories(predictions);
            
            return mappedPredictions;
        } catch (error) {
            console.error('Classification error:', error);
            return this.fallbackClassification();
        }
    }

    // Map ImageNet classes to lost item categories
    mapToLostItemCategories(predictions) {
        const lostItemPredictions = [];
        const usedCategories = new Set();

        predictions.forEach(prediction => {
            const className = prediction.className.toLowerCase();
            
            // Find matching category
            for (const [imagenetClass, lostItemCategory] of Object.entries(this.categoryMapping)) {
                if (className.includes(imagenetClass.toLowerCase()) && !usedCategories.has(lostItemCategory)) {
                    lostItemPredictions.push({
                        label: lostItemCategory,
                        confidence: Math.round(prediction.probability * 100),
                        originalClass: className
                    });
                    usedCategories.add(lostItemCategory);
                    break;
                }
            }
        });

        // If no specific matches found, use general categories
        if (lostItemPredictions.length === 0) {
            predictions.slice(0, 3).forEach(prediction => {
                lostItemPredictions.push({
                    label: this.getGeneralCategory(prediction.className),
                    confidence: Math.round(prediction.probability * 60), // Reduce confidence for general categories
                    originalClass: prediction.className
                });
            });
        }

        return lostItemPredictions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
    }

    // Get general category for unmatched items
    getGeneralCategory(className) {
        const lowerClassName = className.toLowerCase();
        
        if (lowerClassName.includes('electronic') || lowerClassName.includes('device')) {
            return 'electronics';
        } else if (lowerClassName.includes('clothing') || lowerClassName.includes('wear')) {
            return 'clothing';
        } else if (lowerClassName.includes('container') || lowerClassName.includes('box')) {
            return 'container';
        } else {
            return 'personal_item';
        }
    }

    // Get friendly display names
    getFriendlyName(mlLabel) {
        const nameMap = {
            'phone': 'Smartphone',
            'laptop': 'Laptop',
            'wallet': 'Wallet',
            'keys': 'Keys',
            'bag': 'Bag',
            'book': 'Book',
            'water_bottle': 'Water Bottle',
            'headphones': 'Headphones',
            'glasses': 'Glasses',
            'jacket': 'Jacket',
            'umbrella': 'Umbrella',
            'charger': 'Charger',
            'watch': 'Watch',
            'jewelry': 'Jewelry',
            'documents': 'Documents',
            'electronics': 'Electronic Device',
            'clothing': 'Clothing Item',
            'container': 'Container',
            'personal_item': 'Personal Item'
        };
        
        return nameMap[mlLabel] || mlLabel;
    }

    // Generate description from predictions
    generateDescription(predictions) {
        if (predictions.length === 0) {
            return "Our AI analyzed your image. Please provide a detailed description of the item.";
        }
        
        const topPrediction = predictions[0];
        const otherPredictions = predictions.slice(1, 3);
        
        let description = `Our AI detected a ${this.getFriendlyName(topPrediction.label).toLowerCase()} `;
        description += `(${topPrediction.confidence}% confidence). `;
        
        if (otherPredictions.length > 0) {
            description += `It might also be ${otherPredictions.map(p => 
                this.getFriendlyName(p.label).toLowerCase()
            ).join(' or ')}. `;
        }
        
        description += "Please verify and add more details if needed.";
        
        return description;
    }

    // Extract feature vector for similarity comparison
    async extractFeatures(imageElement) {
        if (!this.isLoaded) {
            await this.loadModel();
        }

        if (!this.model) {
            return null;
        }

        try {
            const tensor = this.model.infer(imageElement, true); // true for embedding
            const features = await tensor.data();
            tensor.dispose();
            return Array.from(features);
        } catch (error) {
            console.error('Feature extraction error:', error);
            return null;
        }
    }

    // Calculate similarity between two feature vectors
    calculateSimilarity(features1, features2) {
        if (!features1 || !features2 || features1.length !== features2.length) {
            return 0;
        }

        // Cosine similarity
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < features1.length; i++) {
            dotProduct += features1[i] * features2[i];
            norm1 += features1[i] * features1[i];
            norm2 += features2[i] * features2[i];
        }

        if (norm1 === 0 || norm2 === 0) return 0;
        
        const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
        return Math.max(0, similarity); // Ensure non-negative
    }

    // Find similar items based on image features
    async findSimilarItems(searchImageElement, allItems, threshold = 0.3) {
        const searchFeatures = await this.extractFeatures(searchImageElement);
        const similarItems = [];

        for (const item of allItems) {
            if (!item.imageURL) continue;

            let similarity = 0;
            
            // For demo purposes, we'll use category matching
            // In a real app, you'd compare feature vectors
            const searchPredictions = await this.classifyImage(searchImageElement);
            const itemPredictions = item.mlAnalysis ? item.mlAnalysis.predictions : [];
            
            similarity = this.calculateCategorySimilarity(searchPredictions, itemPredictions);

            if (similarity >= threshold) {
                similarItems.push({
                    ...item,
                    similarity: Math.round(similarity * 100)
                });
            }
        }

        return similarItems.sort((a, b) => b.similarity - a.similarity);
    }

    // Category-based similarity fallback
    calculateCategorySimilarity(searchPredictions, itemPredictions) {
        if (!searchPredictions || !itemPredictions) return 0;

        let maxSimilarity = 0;
        
        for (const searchPred of searchPredictions) {
            for (const itemPred of itemPredictions) {
                if (searchPred.label === itemPred.label) {
                    const confidenceSimilarity = 1 - Math.abs(searchPred.confidence - itemPred.confidence) / 100;
                    maxSimilarity = Math.max(maxSimilarity, confidenceSimilarity * 0.8);
                }
            }
        }

        return maxSimilarity;
    }

    // Fallback classification
    fallbackClassification() {
        return [
            { label: 'personal_item', confidence: 65, originalClass: 'general item' }
        ];
    }
}

// Initialize the classifier
const mlClassifier = new MobileNetClassifier();

// Preload the model when the page loads
window.addEventListener('load', () => {
    mlClassifier.loadModel().then(() => {
        console.log('ML model ready for use');
    });
});