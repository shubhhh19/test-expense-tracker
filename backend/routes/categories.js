const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all categories for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { userId: req.user.id }
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// Create a new category
router.post('/', auth, async (req, res) => {
    try {
        const { name, type, description } = req.body;

        const category = await Category.create({
            name,
            type,
            description,
            userId: req.user.id
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            message: 'Error creating category',
            error: error.message
        });
    }
});

// Update a category
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, type, description } = req.body;
        const category = await Category.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        await category.update({ name, type, description });

        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            message: 'Error updating category',
            error: error.message
        });
    }
});

// Delete a category
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!category) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        await category.destroy();

        res.json({
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            message: 'Error deleting category',
            error: error.message
        });
    }
});

module.exports = router; 