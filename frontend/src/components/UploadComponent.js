import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Papa from "papaparse";
import stringSimilarity from "string-similarity";
import AddMedicineForm from "./AddMedicineForm";
import "./UploadContainer.css";

const UploadComponent = ({ onAddMedicine }) => {
  const [detectedMedicines, setDetectedMedicines] = useState([]);
  const [medicineList, setMedicineList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForms, setShowForms] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/medicine.csv");
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (result) => {
            const medicines = result.data
              .map((row) => row.Cleaned_Medicine_Name?.trim())
              .filter((name) => name);
            setMedicineList(medicines);
          },
        });
      } catch (error) {
        console.error("Error loading the medicine dataset:", error);
        setError("Failed to load the medicine dataset. Please try again.");
      }
    };
    fetchData();
  }, []);

  const preprocessImage = (file) => file;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      setLoading(true);
      setError("");
      setDetectedMedicines([]);
      setShowForms(false);

      const processedFile = preprocessImage(file);

      Tesseract.recognize(processedFile, "eng", { logger: (m) => console.log(m) })
        .then(({ data: { text } }) => {
          console.log("OCR Output:", text);
          processOCRText(text);
        })
        .catch((err) => {
          console.error("OCR error:", err);
          setError(`Error during OCR processing: ${err.message}`);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("Please upload a valid PNG, JPEG, or JPG image.");
    }
  };

  const processOCRText = (text) => {
    const ocrWords = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word);

    console.log("Processed OCR Words:", ocrWords);

    const exactMatches = [];
    const fuzzyMatches = [];

    medicineList.forEach((medicine) => {
      const cleanMedicine = medicine.toLowerCase().trim();
      if (ocrWords.join(" ").includes(cleanMedicine)) {
        exactMatches.push(medicine);
      }
    });

    ocrWords.forEach((word) => {
      const matches = stringSimilarity.findBestMatch(word, medicineList);
      if (matches.bestMatch.rating >= 0.8) {
        fuzzyMatches.push(medicineList[matches.bestMatchIndex]);
      }
    });

    const combinedMatches = [...new Set([...exactMatches, ...fuzzyMatches])];

    if (combinedMatches.length === 0) {
      setError("No medicines detected.");
    } else {
      setError("");
      setDetectedMedicines(combinedMatches.sort());
    }
      // Log the detected medicines to the console
  console.log("Detected Medicines:", combinedMatches);

  };

  const toggleForms = () => {
    setShowForms((prev) => !prev);
  };

  const handleMedicineAdded = (medicine) => {
    setDetectedMedicines((prevMedicines) =>
      prevMedicines.filter((med) => med !== medicine)
    );
    onAddMedicine(medicine);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload({ target: { files: [file] } });
    }
  };

  return (
    <div className="upload-container">
      <h2>Search any image with PillPerfect</h2>
      <div
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label className="upload-button">
          Drag and drop an image here or click to upload
          <input
            type="file"
            accept=".png, .jpeg, .jpg"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {loading && <div className="loading-indicator">Processing OCR...</div>}

      {error && <div className="error-message">{error}</div>}

      {detectedMedicines.length > 0 && (
        <button className="add-medicine-button" onClick={toggleForms}>
          {showForms ? "Hide Medicine Forms" : "Add Medicines"}
        </button>
      )}

      {showForms && (
        <div className="forms-container">
          {detectedMedicines.map((medicine, index) => (
            <AddMedicineForm
              key={index}
              onAddMedicine={() => handleMedicineAdded(medicine)}
              prefilledMedicineName={medicine}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
