const FAQ = require("../models/FAqModel");

// Create a new FAQ entry
exports.createFAQ = async (req, res) => {
    try {
        const faq = new FAQ(req.body);
        await faq.save();
        res.status(201).json({message:"FAQ Created Successfully",faq});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all FAQ entries
exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.json({message:"FAQ fetched Successfully",faqs});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single FAQ entry by ID
exports.getFAQById = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ error: "FAQ not found" });
        res.json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an FAQ entry by ID
exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faq) return res.status(404).json({ error: "FAQ not found" });
        res.json({message:"FAQ updated successfully",faq});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an FAQ entry by ID
exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) return res.status(404).json({ error: "FAQ not found" });
        res.json({ message: "FAQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
