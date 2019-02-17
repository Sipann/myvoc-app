const availableCategories = state => {
  if (state.categoriesLocal.data_values) {
    let allLocalValues = state.categoriesLocal.data_values.slice();
    let availableCat = [];
    allLocalValues.forEach(item => {
      availableCat.push(item._id);
    });
    return availableCat;
  } else { return []; }

};

const availableTags_locale = state => {
  if (state.language === 'FR') { return ['Faible', 'Medium', 'Fréquent']; }
  else { return ['Low', 'Medium', 'High']; }
};


// const vocLength = state => {
//   return state.vocabularyList.length;
// };


export {
  availableCategories,
  availableTags_locale,
  // vocLength,
};
