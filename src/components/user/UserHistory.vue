<template lang="html">
  <div class="section-graph">
    <v-select
      @change='selectChange'
      :disabled="noVoc"
      :items="items"
      label="Show my Voc Information"></v-select>

    <h3>{{ graphTitle }}</h3>

    <div v-if="noVoc" class="no-voc">
      <div class="first-div">
        <p>You can visualize your history here</p>
      </div>
      <div class="second-div">
        <p ref="secondText">Well... When you have one!</p>
      </div>
      <svg viewBox="-5 -5 490 310">

        <path id="rectangle" d="M 148,80 H 2 V 4 H 478 V 80 H 332" />

        <path id="bubble" ref="bubble" d="M 309 80 C 295.95277 79.875 332.13286 79.790597 323.142 80 C 311.0028 80.28273 292.614 79.95207 285.114 80 C 274.93548 80.06505 299.26684 80.04433 274.38118 80 C 264.81541999999996 79.98296 258.31501999999995 80 247.99299999999997 80 C 237.81709999999995 80 231.19323999999997 79.9888 221.89148999999998 80 C 212.08323 80.01181 216.19582999999997 79.9876 205.87099999999998 80 C 191.87099999999998 80.01681 201.19532999999998 79.98279 191.71099999999998 80 C 184.18126999999998 80.01366 188.35744 80.125 179.99999999999997 80" />


        <path id="left" ref="leftBorder" d="M 143.18912,80 H 184.4" />

        <path id="right" ref="rightBorder" d="M 338.70415,80 H 305.7" />

      </svg>
    </div>



    <div v-else class="canvas">
      <svg width="480" height="480"><g id="graph"></g></svg>
    </div>
  </div>
</template>

<script>

  import d3Tip from "d3-tip";
  import { totalPieGraph, totalBarGraph } from '@/utils/helpers';
  import { bubbleAnimation, leftBorderAnimation, rightBorderAnimation } from '@/assets/anim-novoc.js';


  export default {

    name: 'user-history',


    data() {
      return {
        graphTitle: '',
        items: [
          { text: 'Show By Number of Tests (Total)', value: 'total_tests' },
          { text: 'Show By Number of Words (Total)', value: 'total_words' },
          { text: 'Show By Number of Tests (Last Month)', value: 'month_tests' },
          { text: 'Show By Number of Words (Last Month)', value: 'month_words' },
          { text: 'Show All Categories', value: 'cat_all' },
          { text: 'Show Tested Categories', value: 'cat_tested' },
          { text: 'Show All Tags', value: 'tags_all' },
          { text: 'Show Tested Tags', value: 'tags_tested' },
          { text: 'Show / Tested', value: 'surprise' }
        ],
        graphMargin : { top: 20, right: 20, bottom: 60, left: 60},
        bargraphDrawn: false,
        piegraphDrawn: false,
        innerRadius: 0,
        graphWidth: 400,
        graphHeight: 400,
        graphHeightEnlarged: 401,
      }
    },

    mounted() {
      if (this.noVoc) {
        bubbleAnimation(this.$refs.bubble);
        leftBorderAnimation(this.$refs.leftBorder);
        rightBorderAnimation(this.$refs.rightBorder);

        let secondText = this.$refs.secondText;
        secondText.classList.add('animated');
      }
    },

    computed: {

      outerRadius() {
        return this.graphWidth / 2;
      },

      svgWidth() {
        return this.graphWidth + this.graphMargin.left + this.graphMargin.right
      },
      svgHeight() {
        return this.graphHeight + this.graphMargin.top + this.graphMargin.bottom
      },
      noVoc() {
        return this.$store.state.vocLength < 1;
      },
    },


    methods: {

      // STEP 1 - GLOBAL
      selectChange($event) {
        if (  ($event === 'total_tests') ||
              ($event === 'total_words') ||
              ($event === 'month_tests') ||
              ($event === 'month_words') ) {
          // Need for a bar chart.
          if (this.piegraphDrawn) {
            // delete content of .canvas from previously drawn pie chart.
            this.$d3.select('#graph')
                    .selectAll('path').remove()
                    .selectAll('.nothing').remove();
            this.piegraphDrawn = false;
          }
          if (this.bargraphDrawn) {
            // bar chart structure already in place.
            this.$d3.select('.nothing').remove();
            this.updateBarStructure($event);
          } else {
            // need bar chart structure.
            this.makeBarStructure($event);
            this.bargraphDrawn = true;
          }
        } else if ( ($event === 'cat_all') ||
                    ($event === 'cat_tested') ||
                    ($event === 'tags_all') ||
                    ($event === 'tags_tested') ) {
            // Need for a pie chart.
            if (this.bargraphDrawn) {
              // delete content of .canvas from previously drawn bar chart.
              this.$d3.select('#graph')
                      .selectAll('g').remove();
              this.$d3.select('#graph')
                      .selectAll('rect').remove();
              this.$d3.select('#graph')
                      .selectAll('.nothing').remove();
              this.bargraphDrawn = false;
            }
            if (this.piegraphDrawn) {
              this.$d3.selectAll('.nothing').remove();
              // pie chart structure already in place.
              this.updatePieStructure($event);
            } else {
              // need pie chart structure.
              this.makePieStructure($event);
              this.piegraphDrawn = true;
            }
          }
      },      // END OF selectChange() method.

      ////////////////////////////////////////////////////////////
      /////////// PIE DRAWING ////////////////////////////////////
      ////////////////////////////////////////////////////////////

      makePieStructure(selection) {
        const graph = this.$d3.select('#graph')
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            .attr('transform', `translate(${this.svgWidth/2}, ${this.svgHeight/2})`);
        this.updatePieStructure(selection);
      },      // END OF makePieStructure() method.

      async updatePieStructure(selection) {
        let data = [];
        switch(selection) {
          case 'cat_all':
            data = await totalPieGraph('category');
            this.makePieGraph(data, false);
            break;
          case 'cat_tested':
            data = await totalPieGraph('category');
            this.makePieGraph(data, true);
            break;
          case 'tags_all':
            data = await totalPieGraph('tag');
            this.makePieGraph(data, false);
            break;
          case 'tags_tested':
            data = await totalPieGraph('tag');
            this.makePieGraph(data, true);
            break;
          default:
            console.log('unanticipated choice');
        }

      },      // END OF updatePieStructure() method.


      makePieGraph(data, filterOnTest) {
        console.log('data from makePieGraph', data);
        let d3 = this.$d3;

        const colorScale = d3.scaleOrdinal(['rgba(22, 160, 133, 1)', 'rgba(29, 210, 175, 1)', 'rgba(25, 182, 152, 1)']);
        colorScale.domain(data.map(d => d.targeted));
        const arcPath = d3.arc()
                  .innerRadius(this.innerRadius)
                  .outerRadius(this.outerRadius);

        const pie = filterOnTest ?
              d3.pie().value(d => d.tested.length) :
              d3.pie().value(d => d.wordsLength);
        console.log('pie(data)', pie(data));

        const arcTweenEnter = (d) => {
          let i = d3.interpolate(d.endAngle, d.startAngle);
          return function(t) {
            d.startAngle = i(t);
            return arcPath(d);
          }
        };

        const arcTweenExit = (d) => {
          var i = d3.interpolate(d.startAngle, d.endAngle);
          return function(t){
            d.startAngle = i(t);
            return arcPath(d);
          }
        };

        const arcTweenUpdate = function (d) {
          var i = d3.interpolate(this._current, d);
          this._current = i(1);
          return function(t) {
            return arcPath(i(t));
          }
        };

        const graph = d3.select('#graph');
        const paths = graph.selectAll('path')
                          .data(pie(data));

        paths.exit()
            .transition().duration(750)
            .attrTween('d', arcTweenExit)
            .remove();

        paths.attr('d', arcPath)
            .transition().duration(750)
            .attrTween('d', arcTweenUpdate);

        paths.enter().append('path')
                  .attr('stroke', '#fff')
                  .attr('stroke-width', 3)
                  .attr('fill', d => colorScale(d.data.targeted))
                  .each(function(d) { this._current = d; })
                  .transition().duration(750)
                    .attrTween('d', arcTweenEnter);


        if (!data[0].wordsLength || (filterOnTest && !data[0].tested.length)) {
          this.emptyPie()
        }

      },      // END OF makePieGraph() method.

      emptyPie() {
        setTimeout(() => {
          const svg = this.$d3.select('.canvas svg');
          let nothing = svg.append('circle')
                .attr('class', 'nothing')
                .attr('r', 70)
                .attr('cx', 200)
                .attr('cy', 200)
                .attr('fill', 'blue')
                .transition().duration(750)
                  .attr('r', 20);

          let text1 = svg.append('text')
              .attr('class', 'nothing')
              .attr('stroke-width', 3)
              .style('color', '#333')
              .style('font-size', '2.5rem')
              .style('opacity', 0)
              .attr('transform',`translate(${this.graphWidth / 2 - 20}, ${this.graphHeight / 2 + 10})`)
              .attr('text-anchor', 'end')
              .text('n')
              .transition().duration(750)
                .style('opacity', 1);


          let text2 = svg.append('text')
              .attr('class', 'nothing')
              .attr('stroke-width', 3)
              .style('color', '#333')
              .style('font-size', '2.5rem')
              .style('opacity', 0)
              .attr('transform',`translate(${this.graphWidth / 2 + 20}, ${this.graphHeight / 2 + 10})`)
              .attr('text-anchor', 'start')
              .text('thing to display')
              .transition().duration(750)
                .style('opacity', 1);
        }, 1500)
      },



      ////////////////////////////////////////////////////////////
      /////////// BAR CHART DRAWING ////////////////////////////////////
      ////////////////////////////////////////////////////////////

      makeBarStructure(selection) {

        let d3 = this.$d3;
        const graph = d3.select('#graph')
              .attr('width', this.graphWidth)
              .attr('height', this.graphHeight)
              .attr('transform', `translate(${this.graphMargin.left}, ${this.graphMargin.top})`);

        const xAxisGroup = graph.append('g')
              .attr('transform', `translate(0, ${this.graphHeightEnlarged})`)
              .attr('class', 'xAxisGroup');

        const yAxisGroup = graph.append('g')
              .attr('class', 'yAxisGroup');

        this.updateBarStructure(selection);

      },      // END OF makeBarStructure() method.


      async updateBarStructure(selection) {
        let data = [];
        let target = '';
        switch(selection) {
          case 'total_tests':
            data = await totalBarGraph(false);
            target = 'numberOfTests';
            // this.makeBarGraph(data, 'numberOfTests'); //@TODO True version
            // this.makeBarGraph([], 'numberOfTests');  // @TODO TBD for testing
            break;
          case 'total_words':
            data = await totalBarGraph(false);
            target = 'numberOfWords';
            // this.makeBarGraph(data, 'numberOfWords');
            break;
          case 'month_tests':
            data = await totalBarGraph(true);
            target = 'numberOfTests';
            // this.makeBarGraph(data, 'numberOfTests');
            break;
          case 'month_words':
            data = await totalBarGraph(true);
            target = 'numberOfWords';
            // this.makeBarGraph(data, 'numberOfWords');
            break;
          default:
            console.log('unanticipated choice');
        }
        if (data.length < 1) { this.makeBarGraph([], target); }
        else { this.makeBarGraph(data, target); }
      },      // END OF updateBarStructure()


      makeBarGraph(data, target) {
        console.log('enter makeBarGraph');
        // console.log('data', data);
        let d3 = this.$d3;
        const graph = d3.select('#graph');

        const colorScale = d3.scaleOrdinal(['rgba(22, 160, 133, 1)', 'rgba(29, 210, 175, 1)', 'rgba(25, 182, 152, 1)']);
        colorScale.domain(data.map(d => d[target]));


        // X_AXIS

        let xDomain = data.length < 1 ? ['once upon a time'] : data.map(d => d.date);
        let xRotation = data.length < 1 ? '': 'rotate(-40)';
        let xAnchor = data.length < 1 ? 'middle' : 'end';
        let maxValueY = data.length < 1 ? 0.1 : d3.max(data, d => d[target]);
        // @TODO ANIMATION SUR data.length < 1

        // let xDomain = data.map(d => d.date); //@TODO potentiellement à revoir.
        console.log('xDomain', xDomain);

        const xScale = d3.scaleBand()
              .range([0, this.graphWidth])
              .domain(xDomain)
              .paddingOuter([0.2]);

        const xAxis = d3.axisBottom(xScale);

        const xAxisGroup = d3.select('.xAxisGroup');
        xAxisGroup.selectAll('g').remove();
        xAxisGroup.call(xAxis);
        xAxisGroup.selectAll('text')
              .attr('transform', xRotation)
              .attr('text-anchor', xAnchor)
              .style('font-weight', 'bold')
              .style('font-size', '1rem');

        if (xDomain.length > 5) {
          let ticks = d3.selectAll('.xAxisGroup .tick');
          ticks.attr('class', function(d, i) {
            if (i%5 !== 0) {
              let text = d3.select(this).select('text');
              text.remove();
            } else {
              let text = d3.select(this).select('text');
              text.style('stroke-width', 2);
            }
          });
        }

        // Y_AXIS

        // let maxValueY = d3.max(data, d => d[target]);
        const yScale = d3.scaleLinear()
              .range([this.graphHeight, 0])
              .domain([0, maxValueY]);

        const yAxis = d3.axisLeft(yScale);
        const yAxisGroup = d3.select('.yAxisGroup');
        yAxisGroup.call(yAxis);

        yAxisGroup.selectAll('text')
              .style('font-weight', 'bold')
              .style('font-size', '1rem');

        yAxisGroup.select('path')
              .attr('stroke-width', '3px');


        // RECTS

        const rects = graph.selectAll('rect').data(data);

        rects.exit()
          .attr('y', d => yScale(d[target]))
          .attr('height', d => this.graphHeight - yScale(d[target]))
          .transition().duration(750)
            .attr('y', d => this.graphHeight)
            .attr('height', d => 0)
          .remove();

        rects.attr('x', d => xScale(d.date))  // @TODO
            .attr('y', d => yScale(d[target]))
            .attr('width', xScale.bandwidth())
            .attr('height', d => this.graphHeight - yScale(d[target]))
            .attr('fill', (d, i) => colorScale(i));

        rects.enter().append('rect')
          .attr('x', d => xScale(d.date))   // @// TODO
          .attr('y', d => this.graphHeight)
          .attr('width', xScale.bandwidth())
          .attr('height', d => 0)
          .attr('fill', (d, i) => colorScale(i))
          .transition().duration(750)
            .attr('y', d => yScale(d[target]))
            .attr('height', d => this.graphHeight - yScale(d[target]));


      },      // END OF makeBarGraph() method.


    },    // END OF METHODS()


  }     // END OF export default (script)



</script>

<style lang="css" scoped>

.no-voc {
  width: 480px;
  height: 300px;
  position: relative;
}

.no-voc > * {
  position: absolute;
  top: 0;
  left: 0;
}

.first-div {
  background: transparent;
  width: 480px;
  height: 76px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  top: 8px;
}


.second-div {
  width: 480px;
  height: 76px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  top: 120px;
}

.first-div p,
.second-div p {
  color: #fff;
  font-size: 1.5rem;
  margin-top: 1rem;
}

.second-div p {
  opacity: 0;
}

.second-div p.animated {
  animation: displayText .5s 2.5s forwards;
}

@keyframes displayText {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

#rectangle {
  fill: turquoise;
  stroke: #fff;
  stroke-width: 4px;
}


#bubble,
#left,
#right {
  stroke: #fff;
  stroke-width: 4px;
}


#bubble {
  stroke: #fff;
  stroke-linecap: 'round';
  stroke-linejoin: 'miter';
  fill: turquoise;
}

  /* .no-voc p:first-child {
    background: #11af9f;
    font-size: 1.3rem;
    width: 100%;
    padding: 20px;
    color: #fff;
  } */




  .section-graph {
    grid-column-start: 3;
  }

.d3-tip {
  font-size: 2rem;
}

/* .xAxisGroup path {
  stroke: #0f0;
} */
</style>
