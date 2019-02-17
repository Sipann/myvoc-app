import * as d3 from "d3";
import { filterWordsQueryLimit } from '@/utils/words';

import { store } from './../store/store';
import { localDB } from '@/utils/databases';
import cuid from 'cuid';

import PouchDB from 'pouchdb';
import findPlugin from "pouchdb-find";
PouchDB.plugin(findPlugin);



function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) { map.set(key, [item]); }
      else { collection.push(item); }
  });
  return map;
}   // END OF groupBy


function groupData(newData, templateCalendar) {

  let groupedData = groupBy(newData, item => item.date);
  let groupedArray = [];
  let finalCalendar = [];

  groupedData.forEach((value, key) => {
    groupedArray.push({
      date: key,
      numberOfWords: d3.sum(value, d => d.numberOfWords),
      numberOfTests: value.length,
    });
  });

  let mergedCalendar = templateCalendar.concat(groupedArray);

  let calendarNested = d3.nest()
    .key(d => d.date)
    .entries(mergedCalendar);
  // console.log('calendarNested', calendarNested);

  calendarNested.forEach(item => {
    finalCalendar.push({
      date: item.key,
      numberOfWords: d3.sum(item.values, d => d.numberOfWords),
      numberOfTests: d3.sum(item.values, d => d.numberOfTests),
    });
  });
  // console.log('finalCalendar', finalCalendar);
  return finalCalendar;

}    // END OF groupData()

function mergeData(newData, templateCalendar) {
  console.log('enter mergeData');
  let groupedData = groupBy(newData, item => item.cleanDay);
  let groupedArray = [];
  let finalCalendar = [];
  console.log('groupedData', groupedData);

  groupedData.forEach((value, key) => {
    groupedArray.push({
      date: key,
      numberOfWords: d3.sum(value, d => d.numberOfWords),
      numberOfTests: value.length,
    });
  });

  // console.log('groupedArray', groupedArray);

  let mergedCalendar = templateCalendar.concat(groupedArray);
  // console.log('mergedCalendar', mergedCalendar);

  let calendarNested = d3.nest()
    .key(d => d.date)
    .entries(mergedCalendar);

  // console.log('calendarNested', calendarNested);

  calendarNested.forEach(item => {
    finalCalendar.push({
      date: item.key,
      numberOfWords: d3.sum(item.values, d => d.numberOfWords),
      numberOfTests: d3.sum(item.values, d => d.numberOfTests),
    });
  });

  // console.log('finalCalendar', finalCalendar);
  return finalCalendar;


}    // END OF mergeData()

function templateCalendar(start, end) {

  let calendarDays = d3.timeDay.range(start, end);
  // console.log('calendarDays from templateCalendar function', calendarDays);

  // REPRENDRE ICI
  let templateCalendar = calendarDays.map(item => ({
    date: item.toDateString(),
    numberOfWords: 0,
    numberOfTests: 0,
  }));
  // console.log('templateCalendar', templateCalendar);
  return templateCalendar;

}   // END OF templateCalendar()

function templateCalendarDays(start, end) {

  let calendarDays = d3.timeDay.range(start, end);
  // console.log('calendarDays from templateCalendar function', calendarDays);

  // REPRENDRE ICI
  let templateCalendar = calendarDays.map(item => ({
    date: item.toDateString(),
    numberOfWords: 0,
    numberOfTests: 0,
  }));
  // console.log('templateCalendar', templateCalendar);
  return templateCalendar;

}   // END OF templateCalendarDays()

function templateCalendarMonths(start, end) {

  let calendarMonths = d3.timeMonth.range(start, end);
  console.log('calendarMonths', calendarMonths);

  let templateCalendar = calendarMonths.map(item => ({
    date: `${item.getMonth()+1} - ${item.getFullYear()}`,     // getMonth() + 1 to display "normal" month # (starts @ 0 in JS)
    numberOfWords: 0,
    numberOfTests: 0,
  }));
  console.log('templateCalendar', templateCalendar);
  return templateCalendar;
}   // END OF templateCalendarMonth()


async function totalPieGraph(target, filter) {

  let selector = '';
  let words = [];
  let breakdown = [];
  let targetedProp = target === 'category' ?
        store.getters.availableCategories.slice() :
        store.state.availableTags.slice();

  for (let i=0; i<targetedProp.length; i++) {
    if (target === 'category') {
      selector = { type: 'word', category: targetedProp[i] };
      words = await filterWordsQueryLimit(selector);

    } else if (target === 'tag') {
      words = await localDB.find({
        selector: { type: 'word', tag: targetedProp[i] },
        use_index: 'index-tested-words-tag'
      });
      words = words.docs;  // sur tag => words.docs alors que "juste" words sur category.

    } else { console.log('unanticipated choice') }
    // console.log('words.length', words.length);

    if (words.length > 0) {
      let tested = [];
      let untested = [];
      for (let j=0; j<words.length; j++) {
        if (words[j].tested === true) { tested.push(words[j]); }
        else { untested.push(words[j]); }
      }
      let result = {
        targeted: targetedProp[i],
        wordsLength: words.length,
        tested,
        untested
      };
      breakdown.push(result);
    }
  }
  return breakdown;


}   // END OF totalPieGraph()


async function totalBarGraph(filter) {

  let now = new Date(); // current date in long format.
  let now_month = now.getMonth();   // current month.
  let one_month_ms = new Date(now).setMonth(now_month - 1); // 1 month ago in milliseconds.
  // let testData = store.state.trackerTests.data;
  let testData = store.state.historyLocal.data_values.slice();
  if (!testData.length) {
    return [];
  } else {
    let firstTest = testData[0].date;   // in milliseconds

    if (firstTest > one_month_ms) {
      // no matter value on filter => less than 1 month of results => displays by day from firstTest date to now.
      let startDate = firstTest;
      let template_calendar = templateCalendarDays(startDate, now);
      let merged_calendar = mergeData(testData, template_calendar);
      return merged_calendar;
    }


    if ( (firstTest < one_month_ms) && filter) {
      // started tests more than 1 month ago but limit result to last month => displays by day from one month ago to now.
      let startDate = one_month_ms;
      let template_calendar = templateCalendarDays(startDate, now);
      let merged_calendar = mergeData(testData, template_calendar);
      return merged_calendar;
    }


    if ( (firstTest < one_month_ms) && !filter) {
      // started tests more than 1 month ago and do not want to limit result => displays by month from firstTest date to now.
      // reformat testData.
      let testDataReformatted = testData.map(item => {
        let dateMonth = new Date(item.date);
        return {
          cleanDay: `${dateMonth.getMonth()+1} - ${dateMonth.getFullYear()}`,
          numberOfWords: item.numberOfWords,
        }
      });
      let startDate = new Date(one_month_ms);
      let template_calendar = templateCalendarMonths(startDate, now);
      let merged_calendar = mergeData(testDataReformatted, template_calendar);
      return merged_calendar;
    }
  }

}     // END OF totalPieGraph()




///////////////////////////////////////////


export {
  groupBy,
  groupData,        // TBC ?
  mergeData,
  templateCalendar,
  templateCalendarMonths,
  totalPieGraph,
  totalBarGraph,
};
