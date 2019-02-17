<template lang="html">

  <div class="main-div">

  <div class="explaining-text">
    <h2>{{ explainingText }}</h2>
  </div>

  <div class="main-container">

    <div class="upper-container" :style="bgStyle">

      <div class="graph">

        <div class="explain-graph-hover">
          <svg id="play-pause-btn" viewBox="0 0 100 100" width="80" height="80" @click="explainPlayPause">
              <path id="circle" fill="#ccc" stroke-width="5" stroke="#333" d="M 87.97799,50.000005 A 37.977994,37.977996 0 0 1 50.000002,87.977993 37.977994,37.977996 0 0 1 12.022007,50.000005 37.977994,37.977996 0 0 1 50.000002,12.022007 37.977994,37.977996 0 0 1 87.97799,50.000005 Z" />
              <path id="arrow" ref="arrow" fill="none" stroke-width="4.273" stroke-linecap="round" stroke-linejoin="round" stroke="#333" d="M 44.976,34.624 L 63.428572,49.6875 L 44.976,64.483"/>
              <path id="left" stroke-width="4.273" stroke-linecap="round" stroke="#333" d="m 44.766478,34.338 -0.18242,30.474407" />
          </svg>
        </div>


        <div class="explain-graph" v-if="explainDashboard">

          <svg id="dashboard-graph" viewBox="0 0 500 300">

            <path id="dashboard-border" ref="dashboardBorder" d="M 481.42857,14.999999 C 431.20207,4.4619233 344.44011,7.8571426 288.57143,7.8571426 248.21151,7.8571426 36.110011,-2.3061958 25,20.714285 6.6086811,58.821988 4.0287176,271.97951 24.285714,285.71428 c 15.592597,10.5722 451.836336,17.23258 454.999996,0 8.67349,-47.24491 24.25512,-226.950193 2.14286,-270.714281 z" />
            <path id="card-voc-border" ref="cardVocBorder" d="m 58.571429,75 c 32.012299,-9.629982 142.470881,-15.717996 173.571431,10e-7 14.59469,7.376049 10.33517,155.859289 5,172.857139 -5.4204,17.26936 -178.540745,11.908 -180.714288,-5.71429 C 53.514201,218.5142 51.500827,94.325835 58.571429,75 Z"/>
            <path id="card-test-border" ref="cardTestBorder" d="m 292.14286,76.428571 c 17.41913,-8.963791 133.61242,-7.087091 155.71429,-0.714286 19.08897,5.504073 10.55741,158.728305 8.57143,173.571425 -2.11185,15.78386 -161.35412,7.15987 -165,-2.14285 -6.41087,-16.35773 -4.4765,-150.816529 0.71428,-170.714289 z" />
            <g id="glass" ref="glass">
              <path d="m 150.80856,138.42857 a 8.5228558,8.5228558 0 0 1 -8.52285,8.52286 8.5228558,8.5228558 0 0 1 -8.52286,-8.52286 8.5228558,8.5228558 0 0 1 8.52286,-8.52285 8.5228558,8.5228558 0 0 1 8.52285,8.52285 z" />
              <path d="m 147.10346,144.43651 c 4.24463,4.43323 8.07007,9.9641 12.2481,14.14213" />
            </g>
            <path id="btn-save-word" ref="btnSaveWord" d="m 81.14286,219.28572 h 47.71429 c 2.216,0 4,1.784 4,4 v 12 c 0,2.216 -1.784,4 -4,4 H 81.14286 c -2.216,0 -4,-1.784 -4,-4 v -12 c 0,-2.216 1.784,-4 4,-4 z" />
            <path id="btn-save-list" ref="btnSaveList" d="m 160.42857,219.28572 h 47.71429 c 2.216,0 4,1.784 4,4 v 12 c 0,2.216 -1.784,4 -4,4 h -47.71429 c -2.216,0 -4,-1.784 -4,-4 v -12 c 0,-2.216 1.784,-4 4,-4 z" />
            <path id="btn-custom-test" ref="btnCustomTest" d="m 321.61502,219.7944 h 47.71429 c 2.216,0 4,1.784 4,4 v 12 c 0,2.216 -1.784,4 -4,4 h -47.71429 c -2.216,0 -4,-1.784 -4,-4 v -12 c 0,-2.216 1.784,-4 4,-4 z" />
            <path id="btn-quick-test" ref="btnQuickTest" d="M 392.32571,219.28932 H 440.04 c 2.216,0 4,1.784 4,4 v 12 c 0,2.216 -1.784,4 -4,4 h -47.71429 c -2.216,0 -4,-1.784 -4,-4 v -12 c 0,-2.216 1.784,-4 4,-4 z" />

            <path id="btn-sync" ref="btnSync" d="M 260.24669,37.543085 A 17.992817,17.992817 0 0 1 242.25388,55.535902 17.992817,17.992817 0 0 1 224.26106,37.543085 17.992817,17.992817 0 0 1 242.25388,19.550268 17.992817,17.992817 0 0 1 260.24669,37.543085 Z" />

          </svg>
        </div>  <!-- END OF div.explain-graph (Dashboard)-->


        <div class="explain-graph" v-if="explainVoclist">

          <svg id="dashboard-graph" viewBox="0 0 500 300">

            <path id="voclist-border" ref="voclistBorder" d="M 481.42857,14.999999 C 431.20207,4.4619233 344.44011,7.8571426 288.57143,7.8571426 248.21151,7.8571426 36.110011,-2.3061958 25,20.714285 6.6086811,58.821988 4.0287176,271.97951 24.285714,285.71428 c 15.592597,10.5722 451.836336,17.23258 454.999996,0 8.67349,-47.24491 24.25512,-226.950193 2.14286,-270.714281 z" />

            <path id="list-word" ref="listWords" d="m 53.314729,174.59895 c 21.130565,-10.06661 42.103004,-29.15582 65.659911,-45.45686 109.93919,-76.076324 -22.77384,86.59787 14.14214,105.05586 32.41421,16.2071 102.00138,-87.37219 136.37059,-95.96449 28.26134,-7.06534 -10.73402,107.83147 -3.03046,123.23861 4.31197,8.62393 104.63606,-122.49628 125.25892,-109.09648 22.58992,14.67791 23.15694,108.57365 44.44671,119.198" />
            <path id="filter-box" ref="filterBox" d="M 46.01506,20.01506 H 466.98494 V 54.98494 H 46.01506 Z" />
            <path id="line-word" ref="lineWord" d="M 88.928993,145.61925 376.66507,144.45681" />
            <path id="edit-box" ref="editBox" d="m 383.82751,118 h 30 v 30 h -30 z" />
            <path id="delete-box" ref="deleteBox" d="m 437.82751,118 h 30 v 30 h -30 z" />
            <path id="check-box" ref="checkBox" d="m 46,118 h 30 v 30 H 46 Z" />
            <path id="update-box" ref="updateBox" d="m 46.01506,68.01506 h 420.96988 v 34.96988 H 46.01506 Z" />

          </svg>
        </div>    <!-- END OF div.explain-graph (VocList)-->

        <div class="explain-graph" v-if="explainProfile">
          <svg id="dashboard-graph" viewBox="0 0 500 300">

            <path id="profile-border" ref="profileBorder" d="M 481.42857,14.999999 C 431.20207,4.4619233 344.44011,7.8571426 288.57143,7.8571426 248.21151,7.8571426 36.110011,-2.3061958 25,20.714285 6.6086811,58.821988 4.0287176,271.97951 24.285714,285.71428 c 15.592597,10.5722 451.836336,17.23258 454.999996,0 8.67349,-47.24491 24.25512,-226.950193 2.14286,-270.714281 z" />

            <path id="card-info" ref="cardInfo" d="M 45.456864,43.421255 C 102.98756,33.346532 172.53701,42.922879 214.48734,42.189359 c 28.17833,-0.492711 14.49145,149.365841 13.80714,202.252261 -0.21211,16.39222 -74.43839,7.3199 -86.87312,8.08121 -54.53894,3.33913 -92.963219,9.53486 -96.093534,-15.92082 -4.539894,-36.91836 -4.529705,-126.21527 0.129038,-193.180755 z" />
            <path id="select-history" ref="selectHistory" d="m 292.94425,44.431407 c 23.99221,-1.59811 169.83565,-0.404472 169.83565,-0.404472 l 2.90042,44.851185 c -21.51237,0.351239 -171.69501,-0.119561 -171.69501,-0.119561 0,0 -3.211,-23.806211 -1.04106,-44.327152 z" />
            <path id="arrow-down" ref="arrowDown" d="M 442.98842,58.930686 H 421.9584 l 10.91734,12.703051 z" />
            <path id="graph-history" ref="graphHistory" d="m 286.88332,115.14209 c 44.03003,-0.24658 143.2527,-2.20927 179.80715,4.04061 7.93433,1.35656 -2.02031,118.18785 -2.02031,118.18785 -23.04433,11.82699 -176.24323,7.2734 -177.78684,-2.02031 -4.01975,-24.20195 -0.80951,-90.54018 0,-120.20815 z" />

          </svg>
        </div>

      </div>  <!-- END OF div.graph -->

      <div class="screen-selector" ref="screenSelector">
        <div class="screen-element" ref="dashboard"
          :style="screenDashboardStyle()">
          <div class="">
            <span class="screen-element-text">Dashboard</span>
            <span class="screen-element-line"> | </span>
          </div>
        </div>
        <div class="screen-element" ref="voclist"
          :style="screenVoclistStyle()">
          <div class="">
            <span class="screen-element-text">MyVoc-List</span>
            <span class="screen-element-line"> | </span>
          </div>
        </div>
        <div class="screen-element" ref="profile"
          :style="screenProfileStyle()">
          <div class="">
            <span class="screen-element-text">Profile</span>
            <span class="screen-element-line"> | </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lower-container" @mousemove = "mouseMoving" @mouseup = "stopDrag">
      <div class="slider-container" :style="sliderStyle">
        <div class="slider-button" @mousedown="startDrag" ref="sliderButton">
          <i class="material-icons">visibility</i>
        </div>
        <svg width="150" height="30" viewBox="0 0 150 30" fill="none">
          <path d="M74.3132 0C47.0043 2.44032e-05 50.175 30 7.9179 30H144.27C99.4571 30 101.622 -2.44032e-05 74.3132 0Z"
          transform="translate(-7.38794 0.5)" fill="#12132c" />
        </svg>
      </div>
    </div>
  </div>   <!-- END OF div.main-container -->

</div>

</template>

<script>

import { animExplainDashboard } from '@/assets/anim-explainDashboard';
import { animExplainVoclist } from '@/assets/anim-explainVoclist';
import { animExplainProfile } from '@/assets/anim-explainProfile';
import { restartAnimBtn, pauseAnimBtn } from '@/assets/anim-explainBtn';

const sliderMinX = 0;
const sliderMaxX = 240;
const coldGradient = { start: '#5564c2', end: '#3a2e8d' };
const hotGradient = { start: '#f0ae4b', end: '#9b4d1b' };

  export default {
    name: 'demo',


    data() {
      return {
        screens: ['Dashboard', 'MyVoc-List', 'Profile'],
        dragging: false,
        initialMouseX: 0,
        sliderX: 0,
        initialSliderX: 0,
        gradientStart: coldGradient.start,
        gradientEnd: coldGradient.end,

        sliderPosition: 0,
        diff0: 0,
        diff1: 0,
        diff2: 0,
        diffDashboard: 0,
        diffVoclist: 100,
        diffProfile: 100,
        lift: 12,

        explainDashboard: true,
        explainVoclist: false,
        explainProfile: false,
        initialCurrentScreen: 'explainDashboard',
        isPlaying: false,
        pauseBtnLabel: 'Pause',
        // isOnPause: true,
        explainingTextIndex: 0,
        explainingTextList: [
          '',
          'This is your dashboard.',
          'Here you can manage your vocabulary.',
          'You can add a word.',
          'Or a whole list of them.',
          'Here you can manage your tests.',
          'You can add up to 5 custom tests.',
          'Or just launch a quick standard one.',
          "if you're online, you can synchronize your local database with the cloud.",
        ],

        explainVoclistList: [
          '',
          'This is your vocabulary list dashboard.',
          'Here will appear your saved list of words.',
          'You can filter it by category or by tag.',
          'For each word, you can edit it...',
          '... or delete it.',
          'Or you can tick the tiny box on its left...',
          'to update or delete several of them at once.',
        ],
        explainProfileList: [
          '',
          'This is your profile dashboard.',
          'Here you can manage your personnal info.',
          'Here you can select what history you want to view',
          'It will appear right here.'
        ],
      }
    },


    computed: {

      // BEGINNING OF GRAPH ANIMATIONS

      currentScreen() {
        let screens = [ { name: 'explainDashboard', value: this.explainDashboard},
                        { name: 'explainVoclist', value: this.explainVoclist},
                        { name: 'explainProfile', value: this.explainProfile} ];
        let current = screens.filter(item => item.value === true);
        return current[0].name;
      },

      explainingText() {
        if (this.explainDashboard) { return this.explainingTextList[this.explainingTextIndex]; }
        if (this.explainVoclist) { return  this.explainVoclistList[this.explainingTextIndex]; }
        if (this.explainProfile) { return this.explainProfileList[this.explainingTextIndex]; }
      },

      timeLine() {
        if (this.explainDashboard) {
          let vm = this;
          let dashboardTimeline = animExplainDashboard(this.$refs.dashboardBorder, this.$refs.cardVocBorder, this.$refs.cardTestBorder, this.$refs.glass, this.$refs.btnSaveWord, this.$refs.btnSaveList, this.$refs.btnCustomTest, this.$refs.btnQuickTest, this.$refs.btnSync, vm);
          let myTimeline = Object.assign({}, dashboardTimeline);
          myTimeline.name = 'dashboardTimeline';
          return myTimeline;
        } else if (this.explainVoclist) {
          let vm = this;
          let voclistTimeline = animExplainVoclist(this.$refs.voclistBorder, this.$refs.listWords, this.$refs.filterBox, this.$refs.lineWord, this.$refs.editBox, this.$refs.deleteBox, this.$refs.checkBox, this.$refs.updateBox, vm);
          let myTimeline = Object.assign({}, voclistTimeline);
          myTimeline.name = 'voclistTimeline';
          return myTimeline;
        } else if (this.explainProfile) {
          let vm = this;
          let profileTimeline = animExplainProfile(this.$refs.profileBorder, this.$refs.cardInfo, this.$refs.selectHistory, this.$refs.arrowDown, this.$refs.graphHistory, vm);
          let myTimeline = Object.assign({}, profileTimeline);
          myTimeline.name = 'profileTimeline';
          return myTimeline;
        } else {
          return 'no timeline';
        }
      },




      // END OF GRAPH ANIMATIONS

//////////////////////////////////////////////////
      // BEGINNING OF SLIDER

      screenDashboardPos() {
        return (this.$refs.dashboard.getBoundingClientRect().left + 50);
      },

      screenVoclistPos() {
        return (this.$refs.voclist.getBoundingClientRect().left + 50);
      },

      screenProfilePos() {
        return (this.$refs.profile.getBoundingClientRect().left + 50);
      },


      screenSelectorWidth() {
        let screenSelector = this.$refs.screenSelector;
        return window.getComputedStyle(screenSelector).width;
      },


      sliderStyle() {
        return `transform: translate3d(${this.sliderX}px, 0, 0)`;
      },


      bgStyle() {
        return `background: linear-gradient(to bottom right, ${this.gradientStart}, ${this.gradientEnd})`;
      },

      // END OF SLIDER
    },

    watch: {
      isPlaying: function(value) {
        if (value === false) {
          pauseAnimBtn(this.$refs.arrow);
        }
      },
    },


    methods: {

      explainPlayPause() {
        if (this.isPlaying === false) {
          console.log('this.isPlaying', this.isPlaying);
          console.log('this.isPlaying was false - setting it to true');
          this.isPlaying = true;
          restartAnimBtn(this.$refs.arrow);
          // if (this.currentScreen !== this.initialCurrentScreen) {
          //   this.initialCurrentScreen = this.currentScreen;
          //   this.timeLine.seek(0);
          // }
          // this.timeLine.play();
          this.timeLine.restart();
          // @TODO => replay l'anim si elle a déjà tourné 1 fois.
          // if (this.timeLine.complete) { console.log('has completed, restarting it'); this.timeLine.restart();}
          // else { console.log('has not completed yet'); this.timeLine.play(); }
        } else if (this.isPlaying === true) {
          console.log('this.isPlaying', this.isPlaying);
          console.log('this.isPlaying was true - setting it to false');
          this.isPlaying = false;
          pauseAnimBtn(this.$refs.arrow);
          this.timeLine.pause();
        }
      },




////////////////////////////////////////////

      // BEGINNING OF SLIDER

      screenDashboardStyle() {
        const distY = Math.abs(this.lift / (this.diffDashboard/40 + 1));
        // return `transform: translate3d(0, ${-distY}px, 0)`;
        // console.log('distY', distY);
        if (distY > 6) {
          this.explainDashboard = true;
          this.explainVoclist = false;
          this.explainProfile = false;
          return `transform: translate3d(0, ${-distY}px, 0); color: deeppink;` }
        else { return `transform: translate3d(0, ${-distY}px, 0)`;}

      },

      screenVoclistStyle() {
        const distY = this.lift / (this.diffVoclist/40 + 1);
        if (distY > 6) {
          this.explainDashboard = false;
          this.explainVoclist = true;
          this.explainProfile = false;
          return `transform: translate3d(0, ${-distY}px, 0); color: deeppink;` }
        else { return `transform: translate3d(0, ${-distY}px, 0)`;}
      },

      screenProfileStyle() {
        const distY = Math.abs(this.lift / (this.diffProfile/40 + 1));
        if (distY > 6) {
          this.explainDashboard = false;
          this.explainVoclist = false;
          this.explainProfile = true;
          return `transform: translate3d(0, ${-distY}px, 0); color: deeppink;` }
        else { return `transform: translate3d(0, ${-distY}px, 0)`;}
      },


      startDrag (e) {
        this.dragging = true;
        this.initialMouseX = e.pageX;
        this.initialSliderX = this.sliderX;

      },

      stopDrag() {

        // SLIDER
        this.dragging = false;

        // GRAPH ANIMATIONS

        if (this.initialCurrentScreen !== this.currentScreen) {
          console.log(`this.initialCurrentScreen: ${this.initialCurrentScreen}`);
          console.log(`this.currentScreen: ${this.currentScreen}`);

        } else { console.log('same screen'); }
      },

      mouseMoving(e) {
        if (this.dragging) {
          // Move the slider
          const dragAmount = e.pageX - this.initialMouseX;
          const targetX = this.initialSliderX + dragAmount;
          // Keep slider inside limits
          this.sliderX = Math.max(Math.min(targetX, sliderMaxX), sliderMinX);


          let sliderButton = document.querySelector('.slider-button');
          let sliderButtonLeft = sliderButton.getBoundingClientRect().left;
          this.sliderPosition = sliderButtonLeft + 25 ;


          let diffDashboard = parseInt(this.sliderPosition) - parseInt(this.screenDashboardPos);
          this.diffDashboard = Math.abs(diffDashboard);

          let diffVoclist = parseInt(this.sliderPosition) - parseInt(this.screenVoclistPos);
          this.diffVoclist = Math.abs(diffVoclist);

          let diffProfile = parseInt(this.sliderPosition) - parseInt(this.screenProfilePos);
          this.diffProfile = Math.abs(diffProfile);


          console.log('this.dragging while mousemoving');
          this.isPlaying = false;
          this.timeLine.pause();
          pauseAnimBtn(this.$refs.arrow);

          if (this.timeLine.name === 'dashboardTimeline') {
            if (this.diffDashboard > 70) {
              this.timeLine.restart();
              this.timeLine.pause();
              this.explainingTextIndex = 0;
            }
          }

          if (this.timeLine.name === 'voclistTimeline') {
            if (this.diffVoclist > 70) {
              this.timeLine.restart();
              this.timeLine.pause();
              this.explainingTextIndex = 0;
            }
          }

          if (this.timeLine.name === 'profileTimeline') {
            if (this.diffProfile > 70) {
              this.timeLine.restart();
              this.timeLine.pause();
              this.explainingTextIndex = 0;
            }
          }




        }
      },



    },  // END OF methods


  }

</script>

<style lang="css" scoped>

.main-div {
  background: #12132c;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.explaining-text {
  min-height: 3rem;
  /* background: red; */
}

.main-div h2 {
  color: #ccc;
  /* line-height: 3.5rem; */
}

.explain-graph {
  width: 80%;
  /* background: yellow; */
  display: flex;
  justify-content: center;
  position: relative;
}



/* .explain-graph svg {
  width: 500px;
  height: 300px;
} */

.explain-graph #dashboard-graph {
  width: 500px;
  height: 300px;
}

/* .explain-graph path {
  stroke: #333;
  fill: none;
  stroke-width: 4px;
} */

.explain-graph #dashboard-graph path {
  stroke: #333;
  fill: none;
  stroke-width: 4px;
}


.graph {
  grid-row-start: 1;
  user-select: none;
  width: 100%;
  background: #ccc;
  height: 75%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.graph {
  position: relative;
}

.explain-graph-hover {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  background: rgba(111, 111, 111, 0.3);
  cursor: pointer;
}

.graph:hover .explain-graph-hover {
  opacity: 1;
  z-index: 5;
}

/* .graph .explain-graph-hover i {
  opacity: 1;
} */

/* .explain-graph:hover .explain-graph-hover {
  opacity: 1;
} */



#dashboard-border,
#voclist-border,
#profile-border {
  stroke-width: 5px;
  stroke-dasharray: 1458 1458;
}
#play-dashboard, #play-voclist, #play-profile { cursor: pointer; }
#play-dashboard path:first-of-type, #play-voclist path:first-of-type, #play-profile path:first-of-type { fill: #333; }
#play-dashboard path:nth-of-type(2), #play-voclist path:first-of-type, #play-profile path:first-of-type { fill: #ccc; }

/* #play_circle_filled {
  fill: #333;
  cursor: pointer;
} */

#card-voc-border { fill: #ccc; }
.explain-graph #dashboard-graph #glass path { fill: #00ffff; }
.explain-graph #dashboard-graph #btn-save-word { fill: #0000ff; }
.explain-graph #dashboard-graph #btn-save-list { fill: #0000ff; }
.explain-graph #dashboard-graph #btn-custom-test { fill: #6780b3; }
.explain-graph #dashboard-graph #btn-quick-test { fill: #6780b3; }
.explain-graph #dashboard-graph #btn-sync { fill: orange; }



.explain-graph #dashboard-graph #list-word {
  stroke-dasharray: 865 865;
  stroke-width: 15px;
  stroke: #6780b3;
  stroke-dashoffset: 865;
 }

.explain-graph #dashboard-graph #card-info { fill: #0000ff; }
.explain-graph #dashboard-graph #arrow-down { fill: #333; }
.explain-graph #dashboard-graph #select-history { fill: #00ffff; }
.explain-graph #dashboard-graph #graph-history { fill: #6780b3; }


body {
  margin: 0;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
}

.main-container {
  display: grid;
  grid-template-columns: 1fr;
  /* grid-template-rows: 3fr 1fr; */
  /* height: 100vh; */

  grid-template-rows: 8fr 1fr;
  height: 75vh;
  width: 50vw;
  /* position: absolute;
  top: 10vh;
  left: 25vw; */
}

.upper-container {
  position: relative;
  background: linear-gradient(to bottom right, #5564c2, #3a2e8d);
}

/* .temperature-text {
  position: absolute;
  bottom: 150px;
  font-size: 100px;
  width: 100%;
  text-align: center;
  user-select: none;
} */






.screen-selector {
  position: absolute;
  /* left: calc(50% - 150px); */
  bottom: 25px;
  user-select: none;

  left: calc(50% - 180px);

}

.screen-element {
  text-align: center;
  display: inline-block;
  /* width: 40px; */

  margin: 0 10px 0 10px;
  opacity: 0.7;

  width: 100px;
  color: #fff;
}

.screen-element div {
  display: flex;
  flex-direction: column;
}

.screen-element-text {
  font-size: 1.3rem;
  /* font-weight: bold; */
}

.screen-element-line {
  /* font-size: 7px; */
  font-size: 2rem;
  display: inline-block;
}



/* .temperature-graduation {
  position: absolute;
  left: calc(50% - 150px);
  bottom: 25px;
  user-select: none;
} */

.lower-container {
  background-color: #12132c;
}



.slider-container {
  width: 150px;
  height: 80px;
  margin-top: -30px;
  margin-left: calc(50% - 187px);
  position: relative;
}

.slider-button {
  position: absolute;
  left: 42px;
  top: 5px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #2724a2;
  cursor: grab;
}

/* .slider-icon {
  margin-top: 16px;
  margin-left: 21px;
  color: white;
} */

i.material-icons {
  margin-top: 1rem;
  margin-left: 1rem;
  color: #fff;
  user-select: none;
}

/* path {
  stroke: deeppink;
} */

</style>
