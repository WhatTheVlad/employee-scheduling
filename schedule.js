/*
    Mock Variables
*/

const emptySchedule = {
  "01.01.2020": {
    day: "",
    night: "",
  },
  "02.01.2020": {
    day: "",
    night: "",
  },
  "03.01.2020": {
    day: "",
    night: "",
  },
  "04.01.2020": {
    day: "",
    night: "",
  },
  "05.01.2020": {
    day: "",
    night: "",
  },
  "06.01.2020": {
    day: "",
    night: "",
  },
  "07.01.2020": {
    day: "",
    night: "",
  },
  "08.01.2020": {
    day: "",
    night: "",
  },
  "09.01.2020": {
    day: "",
    night: "",
  },
  "10.01.2020": {
    day: "",
    night: "",
  },
  "11.01.2020": {
    day: "",
    night: "",
  },
  "12.01.2020": {
    day: "",
    night: "",
  },
  "13.01.2020": {
    day: "",
    night: "",
  },
  "14.01.2020": {
    day: "",
    night: "",
  },
  "15.01.2020": {
    day: "",
    night: "",
  },
  "16.01.2020": {
    day: "",
    night: "",
  },
  "17.01.2020": {
    day: "",
    night: "",
  },
  "18.01.2020": {
    day: "",
    night: "",
  },
  "19.01.2020": {
    day: "",
    night: "",
  },
  "20.01.2020": {
    day: "",
    night: "",
  },
  "21.01.2020": {
    day: "",
    night: "",
  },
  "22.01.2020": {
    day: "",
    night: "",
  },
  "23.01.2020": {
    day: "",
    night: "",
  },
  "24.01.2020": {
    day: "",
    night: "",
  },
  "25.01.2020": {
    day: "",
    night: "",
  },
  "26.01.2020": {
    day: "",
    night: "",
  },
  "27.01.2020": {
    day: "",
    night: "",
  },
  "28.01.2020": {
    day: "",
    night: "",
  },
  "29.01.2020": {
    day: "",
    night: "",
  },
};

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
    App Variables
*/
const DAY = "day";
const NIGHT = "night";
let empNames = [];
let empNameAndShiftSorted = new Map();
let empNameAndUnavail = new Map();

/*
    Util Functions
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

    if (workdayIndex > 1) {
      if (dayShift == "") {
        let availableEmployee = getAvailableEmployeeForDayShift(prevDay, prevDay2);

        newSchedule[workday][DAY] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }

      if (nightShift == "") {
        let availableEmployee = getAvailableEmployeeForNightShift(currentDay, prevDay, prevDay2);

        newSchedule[workday][NIGHT] = availableEmployee;
        employeeObject[availableEmployee].remainingShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
      }
    }
  });
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

/** Schedules employees for the first two days */
function scheduleFirstTwoDays(schedule, firstDay, secondDay, emp1, emp2, emp3) {
  schedule[firstDay][DAY] = emp1;
  schedule[firstDay][NIGHT] = emp2;
  schedule[secondDay][DAY] = emp3;
  schedule[secondDay][NIGHT] = emp1;

  return schedule;
}

/** Central function for computing all employee-related variables. */
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

/*
    Execution
*/

setEmployeeVariables(employeeObject);
scheduleFirstTwoDays(emptySchedule, "01.01.2020", "02.01.2020", "Emp 1", "Emp 2", "Emp 3");
computeSchedule(emptySchedule);

console.log(emptySchedule)


