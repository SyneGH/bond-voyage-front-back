export const syncFAQsToUsers = (faqs: FAQ[]) => {
  try {
    // Save to localStorage for user-side access
    localStorage.setItem('bondvoyage-faqs', JSON.stringify(faqs));
    
    // Dispatch storage event to trigger updates in open tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'bondvoyage-faqs',
      newValue: JSON.stringify(faqs)
    }));
    
    return true;
  } catch (error) {
    console.error('Error syncing FAQs:', error);
    return false;
  }
};

export const getUserFAQs = (): FAQ[] => {
  try {
    const savedFAQs = localStorage.getItem('bondvoyage-faqs');
    return savedFAQs ? JSON.parse(savedFAQs) : [];
  } catch (error) {
    console.error('Error loading user FAQs:', error);
    return [];
  }
};