import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import AddMedicineForm from './AddMedicineForm';
import Papa from 'papaparse';
import Fuse from 'fuse.js';
import './UploadContainer.css';

const UploadComponent = ({ onAddMedicine }) => {
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [detectedMedicines, setDetectedMedicines] = useState([]); // Multiple medicines
    const [medicineList, setMedicineList] = useState([]); // Medicine names from dataset
    const [loading, setLoading] = useState(false); // Loading state for OCR
    const [fuse, setFuse] = useState(null); // State to store the Fuse instance

    // Normalize strings for comparison
    const normalize = (str) => str.replace(/[^\w\s]/g, '').trim().toLowerCase();

    // Load the medicine dataset on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/medicine.csv'); // Path to CSV in public folder
                const csvText = await response.text();

                // Parse CSV data
                Papa.parse(csvText, {
                    header: true,
                    complete: (result) => {
                        const medicines = result.data
                            .map((row) => row.Cleaned_Medicine_Name?.trim()) // Safely access and trim
                            .filter((name) => name); // Remove undefined or empty values

                        setMedicineList(medicines);
                        console.log('Medicine List Loaded:', medicines); // Debugging output

                        // Initialize Fuse.js for fuzzy matching
                        const fuseInstance = new Fuse(medicines, {
                            includeScore: true,
                            threshold: 0.2, // Adjust for tighter matches
                            keys: ['name'], // Consider the 'name' field for matching
                        });
                        setFuse(fuseInstance); // Store the Fuse instance
                    },
                    error: (error) => {
                        console.error('Error parsing CSV file:', error);
                    },
                });
            } catch (error) {
                console.error('Error loading the medicine dataset:', error);
            }
        };
        fetchData();
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            console.log('Image uploaded:', file.name);
            setIsImageUploaded(true);
            setShowForm(false); // Ensure form is hidden after upload
            setDetectedMedicines([]); // Reset detected medicines list

            setLoading(true); // Set loading state for OCR

            // Run OCR to extract text from the image
            Tesseract.recognize(file, 'eng', { logger: (m) => console.log(m) })
                .then(({ data: { text } }) => {
                    const rawText = text.trim();
                    console.log('Raw OCR Text:', rawText);

                    // Normalize and split into words, removing unwanted characters
                    const words = rawText
                        .toLowerCase() // Normalize to lowercase
                        .replace(/[^\w\s]/g, '') // Remove non-word characters
                        .split(/\s+/) // Split by whitespace
                        .filter((word) => word); // Remove empty strings

                    console.log('Normalized Words:', words);

                    // Generate phrases from words with a limit of 2 words for better matching
                    const potentialMatches = [];
                    for (let i = 0; i < words.length; i++) {
                        for (let j = i + 1; j <= Math.min(i + 1, words.length); j++) { // Only two words
                            const phrase = words.slice(i, j + 1).join(' ');
                            potentialMatches.push(phrase);
                        }
                    }

                    console.log('Generated Phrases:', potentialMatches);

                    // Find all matching medicines from the dataset using fuzzy matching
                    const matchedMedicines = potentialMatches.flatMap((phrase) => fuzzyMatchMedicine(phrase, rawText));
                    setDetectedMedicines(matchedMedicines.length > 0 ? [...new Set(matchedMedicines)] : ['No medicines detected']);
                    console.log('Matched Medicines:', matchedMedicines);
                })
                .catch((err) => {
                    console.error('OCR error:', err);
                    alert('Error occurred while extracting text from the image.');
                })
                .finally(() => {
                    setLoading(false); // Reset loading state after OCR
                });
        } else {
            alert('Please upload a PNG or JPEG image.');
        }
    };

    // Fuzzy matching function with filtering and limiting results
    const fuzzyMatchMedicine = (phrase, rawText) => {
        if (!fuse) return []; // Ensure fuse is available

        // Check for exact match first
        if (medicineList.includes(rawText)) {
            return [rawText]; // Return only the exact match
        }

        const results = fuse.search(phrase);

        // Log results for debugging
        console.log(`Matching for phrase: "${phrase}"`, results);

        // Filter out combinations and keep exact or highly relevant matches
        const filteredResults = results.filter((result) => {
            // Only include results that match the detected raw text exactly
            const medicineName = result.item.toLowerCase();
            return medicineName === rawText.toLowerCase(); // Ensure exact match
        });

        // Log filtered results
        console.log(`Filtered results for phrase "${phrase}":`, filteredResults);

        // Get top 1 match (the exact match)
        const topMatches = filteredResults.slice(0, 1).map((result) => result.item);

        return topMatches;
    };

    // Toggle the medicine form visibility
    const toggleFormVisibility = () => {
        setShowForm((prev) => !prev);
    };

    // Add detected medicine to parent component
    const handleAddMedicine = (newMedicine) => {
        onAddMedicine(newMedicine);
    };

    return (
        <div className="upload-container">
            <h2>Search any image with PillPerfect</h2>
            <div className="upload-area">
                <label className="upload-button">
                    Drag an image here or upload a file
                    <input type="file" accept=".png, .jpeg" onChange={handleImageUpload} />
                </label>
            </div>

            {isImageUploaded && (
                <button onClick={toggleFormVisibility} className="add-medicine-button">
                    {showForm ? 'Hide Medicine Form' : 'Add Medicine'}
                </button>
            )}

            {loading && <div className="loading-indicator">Processing OCR...</div>} {/* Show loading */}

            {showForm && detectedMedicines && (
                <AddMedicineForm
                    onAddMedicine={handleAddMedicine}
                    prefilledMedicineName={detectedMedicines.join(', ')} // Prefill with detected medicines
                />
            )}

            {detectedMedicines.length > 0 && !showForm && (
                <div className="detected-medicines">
                    <h3>Detected Medicines:</h3>
                    <ul>
                        {detectedMedicines.map((medicine, index) => (
                            <li key={index}>{medicine}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UploadComponent;
