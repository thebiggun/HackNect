export const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getStatus = (hackathon) => {
    if (!hackathon || !hackathon.registration_deadline) return 'Unknown';
    const now = new Date();
    const deadline = new Date(hackathon.registration_deadline);
    return now <= deadline ? 'Active' : 'Closed';
};
