const { randomUUID } = require('crypto');
'use strict';

// Temporary in-memory storage for contractors
const contractors = [];

// Add a new contractor (throws on missing email or duplicate)
function addContractor(contractor) {
    if (!contractor || !contractor.email) {
        throw new Error('Contractor must have an email');
    }
    if (findContractorByEmail(contractor.email)) {
        throw new Error('Contractor with this email already exists');
    }

    const record = {
        id: randomUUID(),
        businessName: contractor.businessName || '',
        email: contractor.email,
        createdAt: new Date().toISOString(),
        ...contractor
    };

    contractors.push(record);
    return record;
}

// Find contractor by email
function findContractorByEmail(email) {
    return contractors.find(c => c.email === email) || null;
}

// Find contractor by id
function getContractorById(id) {
    return contractors.find(c => c.id === id) || null;
}

// List all contractors (returns a shallow copy)
function listContractors() {
    return contractors.slice();
}

// Remove contractor by id (returns removed contractor or null)
function removeContractorById(id) {
    const idx = contractors.findIndex(c => c.id === id);
    if (idx === -1) return null;
    return contractors.splice(idx, 1)[0];
}

module.exports = {
    addContractor,
    findContractorByEmail,
    getContractorById,
    listContractors,
    removeContractorById
};
