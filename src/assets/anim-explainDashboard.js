import anime from 'animejs';

let autoplay = false;

function animExplainDashboard(dashboardBorder, cardVocBorder, cardTestBorder, glass, btnSaveWord, btnSaveList, btnCustomTest, btnQuickTest, btnSync, vm) {

  console.log('enter animExplainDashboard');

  let dashboardTimeline = anime.timeline({
    autoplay: autoplay,
    easing: 'linear',
  });

  dashboardTimeline
    .add({
      targets: dashboardBorder,
      strokeDashoffset: 0,
      duration: 1000,
    })
    .add({
      targets: [cardVocBorder, cardTestBorder, glass, btnSaveWord, btnSaveList, btnCustomTest, btnQuickTest, btnSync],
      opacity: 1,
      duration: 1000,
    })
    .add({
      targets: [cardVocBorder, cardTestBorder, glass, btnSaveWord, btnSaveList, btnCustomTest, btnQuickTest, btnSync],
      opacity: 0,
      duration: 0,
      offset: 2000,
    })
    .add({
      targets: dashboardBorder,
      strokeDashoffset: 0,
      duration: 1000,
      offset: 2000,
    })

  // 2. dashBoardBorder is drawn
    .add({
      targets: dashboardBorder,
      strokeDashoffset: 0,
      elasticity: 0,
      duration: 2000,
      offset: 2300,
      begin: function() { vm.explainingTextIndex = 1; },
    }).add({
    // 3. cardVocBorder appears with fill solid color
      targets: cardVocBorder,
      opacity: 1,
      duration: 500,
      offset: 4800,
      begin: function() { vm.explainingTextIndex = 2; },
    }).add({
      targets: cardVocBorder,
      fill: ['#33385a', '#ccc', '#33385a', '#ccc'],
      duration: 1500,
      offset: 3000,
    }).add({
      // 4. glass appears
      targets: glass,
      opacity: 1,
      duration: 500,
      offset: 8000,
    }).add({
      // 5. btnSaveWord appears
      targets: btnSaveWord,
      opacity: 1,
      duration: 500,
      offset: 10500,
      begin: function() { vm.explainingTextIndex = 3; },
    }).add({
      // 6. btnSaveList appears
      targets: btnSaveList,
      opacity: 1,
      duration: 500,
      offset: 12000,
      begin: function() { vm.explainingTextIndex = 4; },
    }).add({
      // 7.b cardTestBorder appears
      targets: cardTestBorder,
      opacity: 1,
      duration: 500,
      offset: 13500,
      begin: function() { vm.explainingTextIndex = 5; },
    }).add({
      targets: cardTestBorder,
      fill: ['#33385a', '#ccc', '#33385a', '#ccc'],
      duration: 1500,
      offset: 14000,
    }).add({
      // 8. btnCustomTest appears
      targets: btnCustomTest,
      opacity: 1,
      duration: 500,
      offset: 16000,
      begin: function() { vm.explainingTextIndex = 6; },
    }).add({
      // 9. btnQuickTest appears
      targets: btnQuickTest,
      opacity: 1,
      duration: 500,
      offset: 17500,
      begin: function() { vm.explainingTextIndex = 7; },
    })
    .add({
      // 10. btnSync appears
      targets: btnSync,
      opacity: 1,
      duration: 3000,
      offset: 19000,
      begin: function() { vm.explainingTextIndex = 8; },
      complete: function() {
        console.log('anim completed');
        vm.isPlaying = false;
        vm.explainingTextIndex = 0;
      }
    });


    return dashboardTimeline;

}

export {
  animExplainDashboard,
}
