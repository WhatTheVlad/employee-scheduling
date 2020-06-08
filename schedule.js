/*
    MOCK VARIABLES
*/

const dayJson = {}
const employeeObject = {
  "Emp 1": {
    datesUnavailable: [],
    remainingShifts: 13,
  },
  "Emp 2": {
    datesUnavailable: [],
    remainingShifts: 11,
  },
  "Emp 3": {
    datesUnavailable: [],
    remainingShifts: 12,
  },
  "Emp 4": {
    datesUnavailable: [],
    remainingShifts: 11,
  },
  "Emp 5": {
    datesUnavailable: [],
    remainingShifts: 11,
  },
};

/*
    APP VARIABLES
*/
const DAY = "day";
const NIGHT = "night";
let empNames = [];
let empNameAndShiftSorted = new Map();
let empNameAndUnavail = new Map();


/*
    UTIL FUNCTIONS
*/

/** Main function. Computes schedule according to all rules and filters. */
function computeSchedule(initialSchedule) {
  let newSchedule = initialSchedule;
  let workdaysKeys = Object.keys(initialSchedule);

  Object.entries(newSchedule).map((element) => {
    let workday = element[0];
    let dayShift = element[1][DAY];
    let nightShift = element[1][NIGHT];
    let workdayIndex = workdaysKeys.indexOf(workday);
    let currentDay = Object.entries(newSchedule)[workdayIndex];
    let prevDay = Object.entries(newSchedule)[workdayIndex - 1];
    let prevDay2 = Object.entries(newSchedule)[workdayIndex - 2];
    let availableEmployee = '';

    if (workdayIndex == 0) {
      if (dayShift == "") {
        availableEmployee = empNameAndShiftSorted.keys().next().value;
        newSchedule[workday][DAY] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }

      if (nightShift == "") {
        availableEmployee = getAvailableEmployeeForFirstNightShift(currentDay);
        newSchedule[workday][NIGHT] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }
    } else if (workdayIndex == 1) {
      if (dayShift == "") {
        availableEmployee = getAvailableEmployeeForSecondDayShift(prevDay);
        newSchedule[workday][DAY] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }
      if (nightShift == "") {
        availableEmployee = getAvailableEmployeeForSecondNightShift(prevDay, currentDay);
        newSchedule[workday][NIGHT] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }
    } else {
      if (dayShift == "") {
        availableEmployee = getAvailableEmployeeForDayShift(prevDay, prevDay2);

        newSchedule[workday][DAY] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }

      if (nightShift == "") {
        availableEmployee = getAvailableEmployeeForNightShift(currentDay, prevDay, prevDay2);

        newSchedule[workday][NIGHT] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }
    }
  });
  console.log(newSchedule);
  return newSchedule;
}

/** Checks employee availability for day shifts */
function checkDayShiftAvailability(employee, prevDay, prevDay2) {
  let prevDayShifts = prevDay[1];
  let prevDay2Shifts = prevDay2[1];
  let restShifts = [prevDayShifts[NIGHT], prevDayShifts[DAY], prevDay2Shifts[NIGHT]];

  if (!restShifts.includes(employee)) {
    return true;
  } else {
    return false;
  }
}

/** Checks employee availability for night shifts */
function checkNightShiftAvailability(employee, currentDay, prevDay, prevDay2) {
  let currentDayShifts = currentDay[1];
  let prevDayShifts = prevDay[1];
  let prevDay2Shifts = prevDay2[1];
  let restShifts = [ currentDayShifts[DAY], prevDayShifts[NIGHT], prevDay2Shifts[NIGHT]];

  if (!restShifts.includes(employee)) {
    return true;
  } else {
    return false;
  }
}

/** Central function for computing employee-related variables. */
function setEmployeeVariables(employeeObject) {
  empNames = Object.keys(employeeObject);
  sortEmployeesByNumerOfShifts(employeeObject);
  getEmployeesUnavailable(employeeObject);
}

/** Returns a map of employees and shifts, sorted from most shifts to least. */
function sortEmployeesByNumerOfShifts(employeeObject) {
  let empNameAndShift = new Map();

  Object.entries(employeeObject).map((emp) => {
    let empName = emp[0];
    let remainingShifts = emp[1]["remainingShifts"];

    empNameAndShift.set(empName, remainingShifts);
  });

  empNameAndShiftSorted = new Map(
    [...empNameAndShift.entries()].sort((a, b) => b[1] - a[1])
  );
}

/** Returns a map of employee name and unavailable dates for each employee.  */
function getEmployeesUnavailable(employeeObject) {
  Object.entries(employeeObject).map((emp) => {
    let empName = emp[0];
    let datesUnavailable = emp[1]["datesUnavailable"];

    empNameAndUnavail.set(empName, datesUnavailable);
  });
}

/** Returns the employee most suitable to work a day shift */
function getAvailableEmployeeForDayShift(prevDay, prevDay2) {
  let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
  let result = empNameAndShiftSortedKeys.next();

  while (!result.done) {
    if (checkDayShiftAvailability(result.value, prevDay, prevDay2)) {
      return result.value;
    } else {
      result = empNameAndShiftSortedKeys.next();
    }
  }
}

/** Returns the employee most suitable to work a night shift */
function getAvailableEmployeeForNightShift(currentDay, prevDay, prevDay2) {
    let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
    let result = empNameAndShiftSortedKeys.next();
  
    while (!result.done) {
      if (checkNightShiftAvailability(result.value, currentDay, prevDay, prevDay2)) {
        return result.value;
      } else {
        result = empNameAndShiftSortedKeys.next();
      }
    }
}

/** Returns the employee most suitable to work the first night shift */
function getAvailableEmployeeForFirstNightShift(currentDay) {
  let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
  let result = empNameAndShiftSortedKeys.next();

  while (!result.done) {
    if (currentDay[1][DAY] == result.value) {
      result = empNameAndShiftSortedKeys.next();
    } else {
      return result.value;
    }
  }
}

/** Returns the employee most suitable to work the second day shift */
function getAvailableEmployeeForSecondDayShift(previousDay) {
  let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
  let result = empNameAndShiftSortedKeys.next();

  while (!result.done) {
    if (Object.values(previousDay[1]).includes(result.value)) {
      result = empNameAndShiftSortedKeys.next();
    } else {
      return result.value;
    }
  }
}

/** Returns the employee most suitable to work the second day shift */
function getAvailableEmployeeForSecondNightShift(previousDay, currentDay) {
  let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
  let result = empNameAndShiftSortedKeys.next();
  let restShifts = [previousDay[1][NIGHT], currentDay[1][DAY]]

  while (!result.done) {
    if (restShifts.includes(result.value)) {
      result = empNameAndShiftSortedKeys.next();
    } else {
      return result.value;
    }
  }
}

//Returns a date after given number of days.
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

//Returns an array containing all dates between two given dates.
function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
      dateArray.push(new Date (currentDate));
      currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

//Returns a formatted string
function getFormattedDate(date) {
  let newDate = new Date(date);
  var month = newDate.getMonth() + 1;
  var day = newDate.getDate();
  var year = newDate.getFullYear();

  if (parseInt(month) <= 9) {
    month = '0' + month
  }

  if (parseInt(day) <= 9) {
    day = '0' + day
  }
  return day + "." + month + "." + year;
}

/** Generates a JSON object with day and night shifts between two given dates */
function generateScheduleJson(startDate, endDate) {
  const dateArray = getDates(new Date(startDate), new Date(endDate));

  dateArray.forEach(date => {
    let formattedDate = getFormattedDate(date)
    dayJson[formattedDate] = { day: '', night: '' }
  })
}


/*
    TEST FUNCTIONS
*/

/** Tests if the schedule follows rquested rules */
function testSchedule(testSchedule) {
  let workdaysKeys = Object.keys(testSchedule);
  let dayShifts = [];
  let nightShifts = [];

  Object.entries(testSchedule).map((element) => {
    let workday = element[0];
    let dayShift = element[1][DAY];
    let nightShift = element[1][NIGHT];
    let workdayIndex = workdaysKeys.indexOf(workday);
    let currentDay = Object.entries(testSchedule)[workdayIndex];
    let prevDay = Object.entries(testSchedule)[workdayIndex - 1];
    let prevDay2 = Object.entries(testSchedule)[workdayIndex - 2];

    if (workdayIndex == 0) {
      if (dayShift == "") {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
      } else {
        console.log(workday + ' ' + DAY + ' shift: ' + dayShift)
        dayShifts.push([workday, [DAY, dayShift]])
      }

      if (nightShift == "") {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED')
      } else {
        if (dayShift == nightShift) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT')
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift)
          nightShifts.push([workday, [NIGHT, nightShift]])
        }
      }
    } else if (workdayIndex == 1) {
      if (dayShift == "") {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
      } else {
        if (Object.values(prevDay[1]).includes(dayShift)) {
          console.log('ERROR: ' + workday + ' ' + DAY + ' shift = ' + dayShift + ' INCORRECT ASSIGNMENT')
        } else {
          console.log(workday + ' ' + DAY + ' shift: ' + dayShift)
          dayShifts.push([workday, [DAY, dayShift]])
        }
      }

      if (nightShift == "") {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED')
      } else {
        if ([prevDay[1][NIGHT], currentDay[1][DAY]].includes(nightShift)) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT')
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift)
          nightShifts.push([workday, [NIGHT, nightShift]])
        }
      }
    } else {
      if (dayShift == "") {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
      } else {
        if (!checkDayShiftAvailability(dayShift, prevDay, prevDay2)) {
          console.log('ERROR: ' + workday + ' ' + DAY + ' shift = ' + dayShift + ' INCORRECT ASSIGNMENT')
        } else {
          console.log(workday + ' ' + DAY + ' shift: ' + dayShift)
          dayShifts.push([workday, [DAY, dayShift]])
        }
      }

      if (nightShift == "") {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED');
      } else {
        if (!checkNightShiftAvailability(nightShift, currentDay, prevDay, prevDay2)) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT')
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift)
          nightShifts.push([workday, [NIGHT, nightShift]])
        }
      }
    }
  })

  //console.log(dayShifts)
  //console.log(nightShifts)
}

/*
    EXECUTION
*/


generateScheduleJson('2020/01/01','2020/01/10')
setEmployeeVariables(employeeObject);
computeSchedule(dayJson);
//testSchedule(emptySchedule);


