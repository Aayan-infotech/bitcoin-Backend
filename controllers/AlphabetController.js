const Alphabet = require("../models/alphabetDetailsModel");

// Create a new alphabet entry
exports.createAlphabet = async (req, res) => {
  try {
    const alphabet = new Alphabet({
        alphabet: req.body.alphabet,
        description: req.body.description,
        image: req?.fileLocations[0], // If an image is uploaded
        examples:  req.body.examples ,
        relatedTerms: req.body.relatedTerms
    });
    await alphabet.save();
    res.status(201).json({
      success: true,
      message: "Alphabet Description Created Successfully",
      alphabet,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all alphabet entries
exports.getAllAlphabets = async (req, res) => {
  try {
    const alphabets = await Alphabet.find();
    res.json({
      success: true,
      message: "Alphabet Description fetched Successfully",
      alphabets,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single alphabet entry by ID
exports.getAlphabetById = async (req, res) => {
  try {
    const alphabet = await Alphabet.findById(req.params.id);
    if (!alphabet) return res.status(404).json({ error: "Alphabet not found" });
    res.json({
      success: true,
      message: "Alphabet Description Fetched Successfully",
      alphabet,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an alphabet entry by ID
exports.updateAlphabet = async (req, res) => {
  try {
    const { alphabet, description, relatedTerms, examples } = req.body;
    const file = req.fileLocations[0];
    
    const updateData = { alphabet, description, relatedTerms, examples };

    if (file) {
      updateData.image = file;
    }

    const alphabetTerm = await Alphabet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!alphabetTerm)
      return res.status(404).json({ error: "Alphabet not found" });

    res.json({
      success: true,
      message: "Alphabet updated successfully",
      alphabetTerm,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Delete an alphabet entry by ID
exports.deleteAlphabet = async (req, res) => {
  try {
    const alphabet = await Alphabet.findByIdAndDelete(req.params.id);
    if (!alphabet) return res.status(404).json({ error: "Alphabet not found" });
    res.json({ message: "Alphabet deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
