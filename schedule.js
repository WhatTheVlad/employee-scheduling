/*
    APP VARIABLES
*/
const DAY = "day";
const NIGHT = "night";
let dayJson = {};
const employeeObject = {};
let empNameAndShiftSorted = new Map();
let minimumShifts = 0;
let remainingShifts = 0;

/*
    HTML FUNCTIONS
*/

/** Adds an employee element to the employeeObject */
//TODO: add check for empty string
function addEmployee() {
  let empName = document.getElementById("empFullNameTxt").value;
  
  employeeObject[empName] = {
    datesUnavailable: [],
    totalShifts: 0
  }
  document.getElementById("empFullNameTxt").value = "";
  console.log(employeeObject)
  updateEmployeeTable();
}

/** Adds the dates for which an employee is unavailable */
//TODO: add check for empty string
function addDatesUnavailable() {
  let empName = document.getElementById("empFullNameTxt").value;
  let newDateUnavailable = document.getElementById("empDateUnavailableTxt").value;
  let currentDatesUnavailable = employeeObject[empName]['datesUnavailable'];

  currentDatesUnavailable.push(newDateUnavailable);
  // Object.entries(datesUnavailable).map(date => {
  //   currentDatesUnavailable.push(date[1]);
  // });
  updateEmployeeTable();
}

/** Generates the schedule with the available user data. */
function generateSchedule() {
  setEmployeeVariables(dayJson, employeeObject);
  computeSchedule(dayJson);
  testSchedule(dayJson);
  showScheduleTable();
}

/** Fills employee table with the current employee database. */
function updateEmployeeTable(){
  let empTable = document.getElementById("employeeTbl");
  let oldTbody = empTable.tBodies[0];
  let newTbody = document.createElement('tbody');

  Object.entries(employeeObject).map(ele => {
    let newRow = newTbody.insertRow(-1);
    let empNameCell = newRow.insertCell(-1);
    let empTotalShiftsCell = newRow.insertCell(-1);
    let empDatesUnavailableCell = newRow.insertCell(-1);

    empNameCell.innerHTML = ele[0];
    empDatesUnavailableCell.innerHTML = ele[1]['datesUnavailable'];
    empTotalShiftsCell.innerHTML = ele[1]['totalShifts']
    
  })

  oldTbody.parentNode.replaceChild(newTbody, oldTbody)

}

/** Fills schedule table with the generated schedule. */
function showScheduleTable(){
  let scheduleTable = document.getElementById("scheduleTbl");
  let headerRow = scheduleTable.insertRow(0);
  let dayShiftRow = scheduleTable.insertRow(1);
  let nightShiftRow = scheduleTable.insertRow(1);

  Object.entries(dayJson).map(ele => {
    let newHeaderCell = headerRow.insertCell(-1);
    let dayShiftCell = dayShiftRow.insertCell(-1);
    let nightShiftCell = nightShiftRow.insertCell(-1);

    newHeaderCell.innerHTML = ele[0];
    dayShiftCell.innerHTML = ele[1]['day'];
    nightShiftCell.innerHTML = ele[1]['night']
    
  })
}

/** Disables HTML elements for STEP1 */
function confirmSchedule() {
  let startDate = document.getElementById("dataInceputTxt");
  let endDate = document.getElementById("dataSfarsitTxt");
  let confirmScheduleBtn = document.getElementById("confirmScheduleBtn");
  let editScheduleBtn = document.getElementById("editScheduleBtn");
  let empFullNameTxt = document.getElementById("empFullNameTxt");
  let addEmpNameBtn = document.getElementById("addEmpNameBtn");
  let confirmEmployeesBtn = document.getElementById("confirmEmployeesBtn");
  
  dayJson = generateEmptyScheduleJson(getParsedDate(startDate.value), getParsedDate(endDate.value));
  startDate.disabled = true;
  endDate.disabled = true;
  confirmScheduleBtn.disabled = true;
  editScheduleBtn.disabled = false;
  empFullNameTxt.disabled = false;
  addEmpNameBtn.disabled = false;
  confirmEmployeesBtn.disabled = false;
}

/** Enables HTML elements for STEP1 */
function editSchedule() {
  document.getElementById("dataInceputTxt").disabled = false;
  document.getElementById("dataSfarsitTxt").disabled = false;
  document.getElementById("confirmScheduleBtn").disabled = false;
  document.getElementById("empFullNameTxt").disabled = true;
  document.getElementById("addEmpNameBtn").disabled = true;
  document.getElementById("editScheduleBtn").disabled = true;
  document.getElementById("confirmEmployeesBtn").disabled = true;
  document.getElementById("confirmDatesUnavailableBtn").disabled = true;
  document.getElementById("editEmployeesBtn").disabled = true;
  document.getElementById("editDatesUnavailableBtn").disabled = true;
}

/** Disables HTML elements for STEP2 */
function confirmEmployees() {
  document.getElementById("empFullNameTxt").disabled = true;
  document.getElementById("addEmpNameBtn").disabled = true;
  document.getElementById("confirmEmployeesBtn").disabled = true;
  document.getElementById("confirmDatesUnavailableBtn").disabled = false;
  document.getElementById("editEmployeesBtn").disabled = false;
  document.getElementById("addEmpDatesUnavailableBtn").disabled = false;
  document.getElementById("empDateUnavailableTxt").disabled = false;
}

/** Enables HTML elements for STEP2 */
function editEmployees() {
  document.getElementById("empFullNameTxt").disabled = false;
  document.getElementById("addEmpNameBtn").disabled = false;
  document.getElementById("confirmEmployeesBtn").disabled = false;
  document.getElementById("editEmployeesBtn").disabled = true;
  document.getElementById("confirmDatesUnavailableBtn").disabled = true;
  document.getElementById("confirmScheduleBtn").disabled = true;
  document.getElementById("editEmployeesBtn").disabled = true;
  document.getElementById("addEmpDatesUnavailableBtn").disabled = true;
  document.getElementById("empDateUnavailableTxt").disabled = true;
  document.getElementById("editDatesUnavailableBtn").disabled = true;
}

function confirmDatesUnavailable() {
  document.getElementById("addEmpDatesUnavailableBtn").disabled = true;
  document.getElementById("empDateUnavailableTxt").disabled = true;
  document.getElementById("confirmDatesUnavailableBtn").disabled = true;
  document.getElementById("editDatesUnavailableBtn").disabled = false;
  document.getElementById("generateScheduleBtn").disabled = false;
}

function editDatesUnavailable() {
  document.getElementById("addEmpDatesUnavailableBtn").disabled = false;
  document.getElementById("empDateUnavailableTxt").disabled = false;
  document.getElementById("confirmDatesUnavailableBtn").disabled = false;
  document.getElementById("editDatesUnavailableBtn").disabled = true;
}


/*
    UTIL FUNCTIONS
*/

/** Main function. Computes schedule according to all rules and filters. */
function computeSchedule(newSchedule) {
  Object.entries(newSchedule).map((element) => {
    let workday = element[0];
    let dayShift = element[1][DAY];
    let nightShift = element[1][NIGHT];
    let workdayIndex = Object.keys(newSchedule).indexOf(workday);
    let currentDay = Object.entries(newSchedule)[workdayIndex];
    let prevDay = Object.entries(newSchedule)[workdayIndex - 1];
    let prevDay2 = Object.entries(newSchedule)[workdayIndex - 2];

    if (workdayIndex == 0) {
      scheduleFirstDay(newSchedule, workday, dayShift, nightShift, currentDay);
    } else if (workdayIndex == 1) {
      scheduleSecondDay(newSchedule, workday, dayShift, nightShift, prevDay, currentDay);
    } else {
      scheduleRemainingDays(newSchedule, workday, dayShift, nightShift, prevDay2, prevDay, currentDay);
    }
  });
  //console.log(newSchedule);
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
  let restShifts = [currentDayShifts[DAY], prevDayShifts[NIGHT], prevDay2Shifts[NIGHT]];

  if (!restShifts.includes(employee)) {
    return true;
  } else {
    return false;
  }
}

/** Sets required employee-related variables. */
function setEmployeeVariables(dayJson, employeeObject) {
  setEmployeeTotalShifts(dayJson, employeeObject);
  sortEmployeesByNumerOfShifts(employeeObject);
}

/** Sets the total number of shifts each employee must work, according to the requested timeline. */
function setEmployeeTotalShifts(dayJson, employeeObject) {
    let totalRequiredShifts = Object.keys(dayJson).length * 2;
    let numberOfEmployees = Object.keys(employeeObject).length;
    minimumShifts = Math.floor(totalRequiredShifts / numberOfEmployees);
    remainingShifts = totalRequiredShifts - (numberOfEmployees * minimumShifts);

    setEmployeeMinimumShifts(employeeObject, minimumShifts);
    setEmployeeRemainingShifts(employeeObject, remainingShifts);
    updateEmployeeTable();
}

/** Sets the minimum number of shifts an employee must work, according to the requested timeline. */
function setEmployeeMinimumShifts(employeeObject, minimumShifts) {
    Object.entries(employeeObject).map( emp => 
        emp[1].totalShifts = minimumShifts
        );
}

/** Distributes the remaining number of shifts between employees, according to the requested timeline. */
function setEmployeeRemainingShifts(employeeObject, remainingShifts) {
  let empObjectEntries = Object.entries(employeeObject);

  for (i = 0; i < remainingShifts; i++) {
    let emp = empObjectEntries[i];
    emp[1].totalShifts += 1;
  }
}


/** Returns a map of employees and shifts, sorted from most shifts to least. */
function sortEmployeesByNumerOfShifts(employeeObject) {
  let empNameAndShift = new Map();

  Object.entries(employeeObject).map((emp) => {
    let empName = emp[0];
    let totalShifts = emp[1]["totalShifts"];
    empNameAndShift.set(empName, totalShifts);
  });

  empNameAndShiftSorted = new Map(
    [...empNameAndShift.entries()].sort((a, b) => b[1] - a[1])
  );
}

/** Returns the employee most suitable to work a day shift */
function getAvailableEmployeeForDayShift(workday, prevDay, prevDay2) {
  let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
  let result = empNameAndShiftSortedKeys.next();

  while (!result.done) {
    if (checkDayShiftAvailability(result.value, prevDay, prevDay2) && isEmployeeAvailable(workday, result.value, employeeObject)) {
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
    if (checkNightShiftAvailability(result.value, currentDay, prevDay, prevDay2) && 
        isEmployeeAvailable(currentDay[0], result.value, employeeObject)) {
      return result.value;
    } else {
      result = empNameAndShiftSortedKeys.next();
    }
  }
}

/** Returns the employee most suitable to work the first day shift */
function getAvailableEmployeeForFirstDayShift(currentDay) {
  let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
  let result = empNameAndShiftSortedKeys.next();

  while (!result.done) {
    if (isEmployeeAvailable(currentDay[0], result.value, employeeObject)) {
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
    if (currentDay[1][DAY] == result.value || !isEmployeeAvailable(currentDay[0], result.value, employeeObject)) {
      result = empNameAndShiftSortedKeys.next();
    } else {
      return result.value;
    }
  }
}

/** Returns the employee most suitable to work the second day shift */
function getAvailableEmployeeForSecondDayShift(previousDay, currentDay) {
  let empNameAndShiftSortedKeys = empNameAndShiftSorted.keys();
  let result = empNameAndShiftSortedKeys.next();

  while (!result.done) {
    if (Object.values(previousDay[1]).includes(result.value) || !isEmployeeAvailable(currentDay[0], result.value, employeeObject)) {
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
    if (restShifts.includes(result.value) || !isEmployeeAvailable(currentDay[0], result.value, employeeObject)) {
      result = empNameAndShiftSortedKeys.next();
    } else {
      return result.value;
    }
  }
}

/** Returns the date after given number of days. */
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

/** Returns an array containing all dates between two given dates. */
function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
      dateArray.push(new Date (currentDate));
      currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

/** Returns a date formatted into string. */
function getFormattedDate(date) {
  let newDate = new Date(date);
  var month = newDate.getMonth() + 1;
  var day = newDate.getDate();
  var year = newDate.getFullYear();

  if (parseInt(month) <= 9) {
    month = '0' + month;
  }

  if (parseInt(day) <= 9) {
    day = '0' + day;
  }
  
  return day + "." + month + "." + year;
}

/** Returns the date in the format */
function getParsedDate(date) {
  let stringDate = date.toString();
  let splitDate = stringDate.split('.');
  let day = splitDate[0];
  let month = splitDate[1];
  let year = splitDate[2];

  return year + '/' + month + '/' + day
}

/** Generates a JSON object with day and night shifts between two given dates */
function generateEmptyScheduleJson(startDate, endDate) {
  const dateArray = getDates(new Date(startDate), new Date(endDate));

  let emptyJ = {}

  dateArray.forEach(date => {
    let formattedDate = getFormattedDate(date);
    emptyJ[formattedDate] = { day: '', night: '' };
  })
  
  return emptyJ;

}

/** Returns  true if the employee is available and false if the employee 
 * is unavailable i.e. vacation, medical leave, other absences */
function isEmployeeAvailable(workday, employee, employeeObject) {
  let datesUnavailable = employeeObject[employee]["datesUnavailable"];
  if (!datesUnavailable.includes(workday)) {
    return true;
  } else {
    return false;
  }
}

/** Generates the employee schedule for the first day */
function scheduleFirstDay(newSchedule, workday, dayShift, nightShift, currentDay) {
  if (dayShift == "") {
    scheduleDayShiftFirstDay(newSchedule, workday, currentDay);
  }
  if (nightShift == "") {
    scheduleNightShiftFirstDay(newSchedule, workday, currentDay);
  }
}

/** Assigns the most suitable employee to work the day shift of the first day */
function scheduleDayShiftFirstDay(newSchedule, workday, currentDay) {
  try {
    let availableEmployee = getAvailableEmployeeForFirstDayShift(currentDay);
    newSchedule[workday][DAY] = availableEmployee;
    employeeObject[availableEmployee].totalShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
    sortEmployeesByNumerOfShifts(employeeObject);
  } catch (error) {
    handleSchedulingError(error, DAY, currentDay[0])
  }
}

/** Assigns the most suitable employee to work the night shift of the first day */
function scheduleNightShiftFirstDay(newSchedule, workday, currentDay) {
    try {
        let availableEmployee = getAvailableEmployeeForFirstNightShift(currentDay);
        newSchedule[workday][NIGHT] = availableEmployee;
        employeeObject[availableEmployee].totalShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
    } catch (error) {
        handleSchedulingError(error, NIGHT, currentDay[0])
    }
}

/** Generates the employee schedule for the second day */
function scheduleSecondDay(newSchedule, workday, dayShift, nightShift, prevDay, currentDay) {
  if (dayShift == "") {
    scheduleDayShiftSecondDay(newSchedule, workday, prevDay, currentDay);
  }
  if (nightShift == "") {
    scheduleNightShiftSecondDay(newSchedule, workday, prevDay, currentDay);
  }
}

/** Assigns the most suitable employee to work the day shift of the second day */
function scheduleDayShiftSecondDay(newSchedule, workday, prevDay, currentDay) {
    try {
        let availableEmployee = getAvailableEmployeeForSecondDayShift(prevDay, currentDay);
        newSchedule[workday][DAY] = availableEmployee;
        employeeObject[availableEmployee].totalShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
    } catch (error) {
        handleSchedulingError(error, DAY, currentDay[0])
    }
}

/** Assigns the most suitable employee to work the night shift of the second day */
function scheduleNightShiftSecondDay(newSchedule, workday, prevDay, currentDay) {
    try{
        let availableEmployee = getAvailableEmployeeForSecondNightShift(prevDay, currentDay);
        newSchedule[workday][NIGHT] = availableEmployee;
        employeeObject[availableEmployee].totalShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
    } catch (error) {
        handleSchedulingError(error, NIGHT, currentDay[0])
    }  
}

/** Generates the employee schedule for the remaining days */
function scheduleRemainingDays(newSchedule, workday, dayShift, nightShift, prevDay2, prevDay, currentDay) {
  if (dayShift == "") {
    scheduleDayShiftRemainingDays(newSchedule, workday, prevDay, prevDay2);
  }
  if (nightShift == "") {
    scheduleNightShiftRemainingDays(newSchedule, workday, prevDay2, prevDay, currentDay);
  }
}

/** Assigns the most suitable employee to work the day shift of the remaining days */
function scheduleDayShiftRemainingDays(newSchedule, workday, prevDay, prevDay2) {
    try {
        let availableEmployee = getAvailableEmployeeForDayShift(workday, prevDay, prevDay2);
        newSchedule[workday][DAY] = availableEmployee;
        employeeObject[availableEmployee].totalShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
    } catch (error) {
        handleSchedulingError(error, DAY, workday)
    }
}

/** Assigns the most suitable employee to work the night shift of remaining days */
function scheduleNightShiftRemainingDays(newSchedule, workday, prevDay2, prevDay, currentDay) {
    try {
        let availableEmployee = getAvailableEmployeeForNightShift(currentDay, prevDay, prevDay2);
        newSchedule[workday][NIGHT] = availableEmployee;
        employeeObject[availableEmployee].totalShifts = empNameAndShiftSorted.get(availableEmployee) - 1;
        sortEmployeesByNumerOfShifts(employeeObject);
    } catch (error) {
        handleSchedulingError(error, NIGHT, currentDay[0])
    }
}

/*
    ERROR HANDLING FUNCTIONS
*/

function handleSchedulingError(error, shift, workday) {
    let romShift;
    
     if (shift == DAY) {
       romShift = "ZI";
     } else {
       romShift = "NOAPTE";
     }
    
    console.log(error);
    alert('Nu s-a gasit niciun angajat disponibil pentru ziua: ' + workday + ", tura de " + romShift)
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
        console.log(workday + ' ' + DAY + ' shift: ' + dayShift);
        dayShifts.push([workday, [DAY, dayShift]]);
      }

      if (nightShift == "") {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED');
      } else {
        if (dayShift == nightShift) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT');
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift);
          nightShifts.push([workday, [NIGHT, nightShift]]);
        }
      }
    } else if (workdayIndex == 1) {
      if (dayShift == "") {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
      } else {
        if (Object.values(prevDay[1]).includes(dayShift)) {
          console.log('ERROR: ' + workday + ' ' + DAY + ' shift = ' + dayShift + ' INCORRECT ASSIGNMENT');
        } else {
          console.log(workday + ' ' + DAY + ' shift: ' + dayShift);
          dayShifts.push([workday, [DAY, dayShift]]);
        }
      }

      if (nightShift == "") {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED');
      } else {
        if ([prevDay[1][NIGHT], currentDay[1][DAY]].includes(nightShift)) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT');
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift);
          nightShifts.push([workday, [NIGHT, nightShift]]);
        }
      }
    } else {
      if (dayShift == "") {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
      } else {
        if (!checkDayShiftAvailability(dayShift, prevDay, prevDay2)) {
          console.log('ERROR: ' + workday + ' ' + DAY + ' shift = ' + dayShift + ' INCORRECT ASSIGNMENT');
        } else {
          console.log(workday + ' ' + DAY + ' shift: ' + dayShift);
          dayShifts.push([workday, [DAY, dayShift]]);
        }
      }

      if (nightShift == "") {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED');
      } else {
        if (!checkNightShiftAvailability(nightShift, currentDay, prevDay, prevDay2)) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT');
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift);
          nightShifts.push([workday, [NIGHT, nightShift]]);
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


// addEmployee('Vlad Mocanu');
// addEmployee('Stefana Donighian');
// addEmployee('Alexandru Aghiniei');
// addEmployee('Cristian Zaharia');
// addEmployee('Bogdan Ghirvu');
// addDatesUnavailable('Vlad Mocanu', ['01.01.2020', '02.01.2020', '03.01.2020'])
// addDatesUnavailable('Stefana Donighian', ['01.01.2020', '05.01.2020', '13.01.2020'])
// addDatesUnavailable('Bogdan Ghirvu', ['12.01.2020', '02.01.2020', '14.01.2020'])
// generateScheduleJson('2020/01/01','2020/01/29');
// setEmployeeVariables(dayJson, employeeObject);
// computeSchedule(dayJson);
// testSchedule(dayJson);
