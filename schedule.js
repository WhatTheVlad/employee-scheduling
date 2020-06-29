/*
    APP VARIABLES
*/
const DAY = 'day';
const NIGHT = 'night';
const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
let employeeObject = {};
let dayJson = {};
let last2Days = {};
let empNameAndShiftSorted = new Map();
let minimumShifts = 0;
let remainingShifts = 0;
let startDate = '';
let endDate = '';
let selectedEmpTblRow = null;
let selectedEmpTblName = '';
let useReferenceDays = false;
let modifiedReferenceDays = false;
let modifiedEmployees = false;
let modifiedAbsences = false;

/*
    HTML FUNCTIONS
*/

/** Adds an employee element to the employeeObject */
//TODO: add check for empty string
function addEmployee() {
  let empName = document.getElementById("empFullNameTxt").value;
  let isNewEmployee = true;

  if (Object.keys(employeeObject).includes(empName)) {
    isNewEmployee = false;
  }

  if (empName == '' || empName == ' ') {
    alert("Completați câmpul ”Nume Angajat”")
  } else {
    if (selectedEmpTblRow != null) {
      selectedEmpTblRow.cells[0].innerHTML = empName;
      if (empName != selectedEmpTblName) {
        employeeObject = updateObjectKey(selectedEmpTblName, empName, employeeObject);
        selectedEmpTblRow = null;
        selectedEmpTblName = '';
      } else {
        let overwriteAbsences = true;
        addAbsences(overwriteAbsences);
        selectedEmpTblRow = null;
        selectedEmpTblName = '';
      }
    } else {
      if (isNewEmployee) {
        employeeObject[empName] = {
          datesUnavailable: [],
          totalShifts: 0
        }
        addAbsences();
      } else {
        addAbsences();
      }
    }
  }

  updateEmployeeTable();

  document.getElementById("empFullNameTxt").value = "";
  document.getElementById("empAbsencesTxt").value = "";
}

/** Adds the dates for which an employee is unavailable */
//TODO: add check for empty string
function addAbsences(overwriteAbsences = false) {
  let empFullNameTxt = document.getElementById("empFullNameTxt");
  let empName = empFullNameTxt.value;
  let empAbsences = document.getElementById("empAbsencesTxt").value
  let newAbsence = empAbsences.replace(/ /g, "").split(',');
  if (overwriteAbsences) {
    employeeObject[empName]['datesUnavailable'] = [];
  }
  let currentAbsences = employeeObject[empName]['datesUnavailable'];

  if (empAbsences != '' && empAbsences != ' ') {
    newAbsence.forEach(date => {
      if (!currentAbsences.includes(date)) {
        currentAbsences.push(date);
      } else {
        alert('Data ' + date + ' este deja înregistrată pentru ' + empName)
      }
    })
  }

  empName = "";
  document.getElementById("generateScheduleBtn").disabled = true;
}

/** Generates the schedule with the available user data. */
function generateSchedule() {
  sortEmployeesByNumerOfShifts(employeeObject);
  computeSchedule(dayJson);
  updateScheduleTable();
  testSchedule(dayJson);
}

/** Fills employee table with the current employee database. */
function updateEmployeeTable(){
  let empTable = document.getElementById("employeeTbl");
  let oldTbody = empTable.tBodies[0];
  let newTbody = document.createElement('tbody');
  let employees = Object.keys(employeeObject);

  Object.entries(employeeObject).map(emp => {
    let indexOfEmp = employees.indexOf(emp[0]);
    let newRow = newTbody.insertRow(-1);
    let empNameCell = newRow.insertCell(-1);
    let empTotalShiftsCell = newRow.insertCell(-1);
    let empAbsencesCell = newRow.insertCell(-1);
    let editCell = newRow.insertCell(-1);

    editCell.innerHTML = '<button type="button" id="editTblEmpBtn' + indexOfEmp + '" name="editTblEmpBtn' + indexOfEmp + '" onClick="editEmpTableRow(this)" class="tableButton">Modifică</button> <button type="button" id="deleteTblEmpBtn' + indexOfEmp + '" name="deleteTblEmpBtn' + indexOfEmp + '" onClick="deleteEmpTableRow(this)" class="tableButton">Șterge</button>';
    empNameCell.innerHTML = emp[0];
    empAbsencesCell.innerHTML = emp[1]['datesUnavailable'];
    empTotalShiftsCell.innerHTML = emp[1]['totalShifts']
  })
  oldTbody.parentNode.replaceChild(newTbody, oldTbody);
}

/** Enables editing the selected row. */
function editEmpTableRow(td) {
  selectedEmpTblRow = td.parentNode.parentNode;
  document.getElementById("empFullNameTxt").value = selectedEmpTblRow.cells[0].innerHTML;
  document.getElementById("empAbsencesTxt").value = selectedEmpTblRow.cells[2].innerHTML;
  selectedEmpTblName = selectedEmpTblRow.cells[0].innerHTML;
}

/** Removes the selected row from the table and the employee object. */
function deleteEmpTableRow(td) {
  if(confirm('Confirmați ștergerea angajatului din tabel')) {
  let row = td.parentNode.parentNode;
  document.getElementById("employeeTbl").deleteRow(row.rowIndex);
  delete employeeObject[row.cells[0].innerHTML];
  }
}

/** Fills schedule table with the generated schedule. */
function updateScheduleTable(){
  let scheduleTable = document.getElementById("scheduleTbl");
  let oldTbody = scheduleTable.tBodies[0];
  let newTbody = document.createElement('tbody');
  let dateRow = newTbody.insertRow(-1);
  let dayShiftRow = newTbody.insertRow(-1);
  let nightShiftRow = newTbody.insertRow(-1);
  let headerFirstRow = dateRow.insertCell(-1);
  let headerSecondRow = dayShiftRow.insertCell(-1);
  let headerThirdRow = nightShiftRow.insertCell(-1);
  headerFirstRow.innerHTML = 'Data';
  headerSecondRow.innerHTML = 'Zi';
  headerThirdRow.innerHTML = 'Noapte'
  
  Object.entries(dayJson).map(ele => {
    let dateCell = dateRow.insertCell(-1);
    let dayShiftCell = dayShiftRow.insertCell(-1);
    let nightShiftCell = nightShiftRow.insertCell(-1);

    dateCell.innerHTML = ele[0];
    dayShiftCell.innerHTML = ele[1][DAY];
    nightShiftCell.innerHTML = ele[1][NIGHT];
  })

  oldTbody.parentNode.replaceChild(newTbody, oldTbody);
}

/** Adds the last 2 reference days for the generated table */
function generateLast2DaysSchedule(){
  let last2DaysTable = document.getElementById("last2DaysTbl");
  let firstRow = last2DaysTable.rows[0];
  let last2Day = firstRow.cells[1];
  let lastDay = firstRow.cells[2];
  let last2DaysKeys = Object.keys(last2Days);

  last2Day.innerHTML = last2DaysKeys[0];
  lastDay.innerHTML = last2DaysKeys[1];
}

/** Page actions for when the Confirm button is clicked in the STEP1 section. */
function confirmSchedule() {
  let startDateTxt = document.getElementById("dataInceputTxt");
  let endDateTxt = document.getElementById("dataSfarsitTxt");
  let confirmScheduleBtn = document.getElementById("confirmScheduleBtn");
  let editScheduleBtn = document.getElementById("editScheduleBtn");
  let empFullNameTxt = document.getElementById("empFullNameTxt");
  let empAbsencesTxt = document.getElementById("empAbsencesTxt");
  let addEmpBtn = document.getElementById("addEmpBtn");
  let confirmEmployeesBtn = document.getElementById("confirmEmployeesBtn");

  if (validateDates(startDateTxt.value, endDateTxt.value)) {
    startDate = startDateTxt.value;
    endDate = endDateTxt.value;
    dayJson = generateEmptyScheduleJson(getParsedDate(startDate), getParsedDate(endDate));
    if(confirm('Doriți să folosiți zile de referință?')) {
      let dayJsonFirstEntry = Object.entries(dayJson)[0][0];
      let prevDay = new Date(getParsedDate(dayJsonFirstEntry)).addDays(-1);
      let prev2Day = new Date(getParsedDate(dayJsonFirstEntry)).addDays(-2);

      last2Days = generateEmptyScheduleJson(prev2Day, prevDay);
      dayJson = generateEmptyScheduleJson(prev2Day, getParsedDate(endDate));
      useReferenceDays = true;
      document.getElementById("step3").hidden = false;
      generateLast2DaysSchedule();
    } else {
      last2Days = {};
      useReferenceDays = false;
      document.getElementById("step3").hidden = true;
    }

    startDateTxt.disabled = true;
    endDateTxt.disabled = true;
    confirmScheduleBtn.disabled = true;
    editScheduleBtn.disabled = false;
    empFullNameTxt.disabled = false;
    empAbsencesTxt.disabled = false;
    addEmpBtn.disabled = false;
    confirmEmployeesBtn.disabled = false;
    document.getElementById("step1").style.backgroundColor = "#b1a8a2f6";
    document.getElementById("step2").style.backgroundColor = "";
    document.getElementById("employeeTblDiv").style.opacity = "1";
    document.getElementById("addEmpDiv").style.opacity = "1";
    document.getElementById("step4").hidden = false;
    document.getElementById("last2DayDayShiftTxt").value = "";
    document.getElementById("last2DayNightShiftTxt").value = "";
    document.getElementById("lastDayDayShiftTxt").value = "";
    document.getElementById("lastDayNightShiftTxt").value = "";
    
  } else {
    startDate = '';
    endDate = ''
    startDateTxt.value = '';
    endDateTxt.value = '';
  }
   updateScheduleTable();
}

/** Page actions for when the Edit button is clicked in the STEP1 section. */
function editSchedule() {
  document.getElementById("dataInceputTxt").disabled = false;
  document.getElementById("dataSfarsitTxt").disabled = false;
  document.getElementById("confirmScheduleBtn").disabled = false;
  document.getElementById("empFullNameTxt").disabled = true;
  document.getElementById("empAbsencesTxt").disabled = true;
  document.getElementById("addEmpBtn").disabled = true;
  document.getElementById("editScheduleBtn").disabled = true;
  document.getElementById("confirmEmployeesBtn").disabled = true;
  document.getElementById("editEmployeesBtn").disabled = true;
  document.getElementById("step1").style.backgroundColor = "";
  document.getElementById("step2").style.backgroundColor = "#b1a8a2f6";
  document.getElementById("step3").style.backgroundColor = "#b1a8a2f6";
  document.getElementById("employeeTblDiv").style.opacity = "0.5";
}

/** Page actions for when the Confirm button is clicked in the STEP2 section. */
function confirmEmployees() {
  if (Object.keys(employeeObject) == 0) {
    alert("Introduceți cel puțin un angajat.")
  } else {
    setEmployeeTotalShifts(dayJson, employeeObject);

    document.getElementById("empFullNameTxt").disabled = true;
    document.getElementById("empAbsencesTxt").disabled = true;
    document.getElementById("addEmpBtn").disabled = true;
    document.getElementById("confirmEmployeesBtn").disabled = true;
    document.getElementById("editEmployeesBtn").disabled = false;
    document.getElementById("editEmployeesBtn").disabled = false;
    document.getElementById("step2").style.backgroundColor = "#b1a8a2f6";
    document.getElementById("employeeTblDiv").style.opacity = "0.5";
    if (useReferenceDays) {
      document.getElementById("confirmLast2DaysBtn").disabled = false;
      document.getElementById("step3").style.backgroundColor = "";
      document.getElementById("last2DaysTblDiv").style.opacity = "1";
      document.getElementById("last2DayDayShiftTxt").disabled = false;
      document.getElementById("last2DayNightShiftTxt").disabled = false;
      document.getElementById("lastDayDayShiftTxt").disabled = false;
      document.getElementById("lastDayNightShiftTxt").disabled = false;
    } else {
      document.getElementById("generateScheduleBtn").disabled = false;
      document.getElementById("scheduleTblDiv").style.opacity = "1";
      
    }
  }
}

/** Page actions for when the Edit button is clicked in the STEP2 section. */
function editEmployees() {
  modifiedEmployees = true;
  document.getElementById("empFullNameTxt").disabled = false;
  document.getElementById("empAbsencesTxt").disabled = false;
  document.getElementById("addEmpBtn").disabled = false;
  document.getElementById("confirmEmployeesBtn").disabled = false;
  document.getElementById("editEmployeesBtn").disabled = true;
  document.getElementById("confirmScheduleBtn").disabled = true;
  document.getElementById("editEmployeesBtn").disabled = true;
  document.getElementById("step1").style.backgroundColor = "#b1a8a2f6";
  document.getElementById("step2").style.backgroundColor = "";
  document.getElementById("step3").style.backgroundColor = "#b1a8a2f6";
  document.getElementById("employeeTblDiv").style.opacity = "1";
}

/** Page actions for when the Confirm button is clicked in the STEP3 section. */
function confirmLast2Days() {
  let last2DayDayShiftTxt = document.getElementById("last2DayDayShiftTxt");
  let last2DayNightShiftTxt = document.getElementById("last2DayNightShiftTxt");
  let lastDayDayShiftTxt = document.getElementById("lastDayDayShiftTxt");
  let lastDayNightShiftTxt = document.getElementById("lastDayNightShiftTxt");
  let last2DaysTable = document.getElementById("last2DaysTbl");

  if (
    last2DayDayShiftTxt.value == '' ||
    last2DayNightShiftTxt.value == '' ||
    lastDayDayShiftTxt.value == '' ||
    lastDayNightShiftTxt.value == ''
  ) {
    alert('Completați toate zilele de referință.')
  } else {
    let firstRow = last2DaysTable.rows[0];
    let last2Day = firstRow.cells[1].innerHTML;
    let lastDay = firstRow.cells[2].innerHTML;

    dayJson[last2Day][DAY] = last2DayDayShiftTxt.value;
    dayJson[last2Day][NIGHT] = last2DayNightShiftTxt.value;
    dayJson[lastDay][DAY] = lastDayDayShiftTxt.value;
    dayJson[lastDay][NIGHT] = lastDayNightShiftTxt.value;

    document.getElementById("confirmLast2DaysBtn").disabled = true;
    document.getElementById("editLast2DaysBtn").disabled = false;
    document.getElementById("last2DaysTblDiv").style.opacity = "0.5";
    document.getElementById("step3").style.backgroundColor = "#b1a8a2f6;";
    document.getElementById("step4").style.backgroundColor = "";
    document.getElementById("generateScheduleBtn").disabled = false;
    document.getElementById("scheduleTblDiv").style.opacity = "1";

    last2DayDayShiftTxt.disabled = true;
    last2DayNightShiftTxt.disabled = true;
    lastDayDayShiftTxt.disabled = true;
    lastDayNightShiftTxt.disabled = true;

    updateScheduleTable();
  }
}

/** Page actions for when the Edit button is clicked in the STEP3 section. */
function editLast2Days() {
  modifiedReferenceDays = true;
  document.getElementById("confirmLast2DaysBtn").disabled = false;
  document.getElementById("editLast2DaysBtn").disabled = true;
  document.getElementById("last2DayDayShiftTxt").disabled = false;
  document.getElementById("last2DayNightShiftTxt").disabled = false;
  document.getElementById("lastDayDayShiftTxt").disabled = false;
  document.getElementById("lastDayNightShiftTxt").disabled = false;
  document.getElementById("step1").style.backgroundColor = "#b1a8a2f6";
  document.getElementById("step2").style.backgroundColor = "#b1a8a2f6";
  document.getElementById("step3").style.backgroundColor = "";
  document.getElementById("last2DaysTblDiv").style.opacity = "1";
}

/** Reloads page */
function reloadPage() {
  if(confirm('Confirmați stergerea datelor curente.')){
    location.reload(true);
  }
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

  modifiedReferenceDays = false;
  modifiedAbsences = false
  modifiedEmployees = false

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

/** Sets the total number of shifts each employee must work, according to the requested timeline. */
function setEmployeeTotalShifts(dayJson, employeeObject) {
  let totalRequiredShifts = 0;
  let numberOfEmployees = Object.keys(employeeObject).length;

  if (useReferenceDays) {
    totalRequiredShifts = (Object.keys(dayJson).length - 2) * 2;
  } else {
    totalRequiredShifts = Object.keys(dayJson).length * 2;
  }
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

/** Returns the date in the dd/MM/yyyy format. */
function getParsedDate(date) {
  let splitDate = date.split('.');
  let day = splitDate[0];
  let month = splitDate[1];
  let year = splitDate[2];

  return year + '/' + month + '/' + day
}

/** Returns total number of days in given month. */
function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/** Returns month index. */
function getMonth(month, year) {
  return new Date(year, month, 0).getMonth();
}

/** Generates a JSON object with day and night shifts between two given dates. */
function generateEmptyScheduleJson(startDate, endDate) {
  const dateArray = getDates(new Date(startDate), new Date(endDate));
  let emptySchedule = {}

  dateArray.forEach(date => {
    let formattedDate = getFormattedDate(date);
    emptySchedule[formattedDate] = { day: '', night: '' };
  })
  
  return emptySchedule;

}

/** Returns  true if the employee is available and false if the employee 
 * is unavailable i.e. vacation, medical leave, other absences. */
function isEmployeeAvailable(workday, employee, employeeObject) {
  let datesUnavailable = employeeObject[employee]["datesUnavailable"];
  if (!datesUnavailable.includes(workday)) {
    return true;
  } else {
    return false;
  }
}

/** Generates the employee schedule for the first day. */
function scheduleFirstDay(newSchedule, workday, dayShift, nightShift, currentDay) {
  if (dayShift == '' || dayShift == undefined || (modifiedEmployees && !useReferenceDays) || (modifiedAbsences && !useReferenceDays)) {
    scheduleDayShiftFirstDay(newSchedule, workday, currentDay);
  }
  if (nightShift == '' || nightShift == undefined || (modifiedEmployees && !useReferenceDays) || (modifiedAbsences && !useReferenceDays)) {
    scheduleNightShiftFirstDay(newSchedule, workday, currentDay);
  } 
}

/** Assigns the most suitable employee to work the day shift of the first day. */
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

/** Assigns the most suitable employee to work the night shift of the first day. */
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

/** Generates the employee schedule for the second day. */
function scheduleSecondDay(newSchedule, workday, dayShift, nightShift, prevDay, currentDay) {
  if (dayShift == '' || dayShift == undefined || (modifiedEmployees && !useReferenceDays) || (modifiedAbsences && !useReferenceDays)) {
    scheduleDayShiftSecondDay(newSchedule, workday, prevDay, currentDay);
  }
  if (nightShift == '' || nightShift == undefined || (modifiedEmployees && !useReferenceDays) || (modifiedAbsences && !useReferenceDays)) {
    scheduleNightShiftSecondDay(newSchedule, workday, prevDay, currentDay);
  }
}

/** Assigns the most suitable employee to work the day shift of the second day. */
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

/** Assigns the most suitable employee to work the night shift of the second day. */
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

/** Generates the employee schedule for the remaining days. */
function scheduleRemainingDays(newSchedule, workday, dayShift, nightShift, prevDay2, prevDay, currentDay) {
  if (dayShift == '' || dayShift == undefined || modifiedReferenceDays || modifiedEmployees || modifiedAbsences) {
    scheduleDayShiftRemainingDays(newSchedule, workday, prevDay, prevDay2);
  }
  if (nightShift == '' || nightShift == undefined || modifiedReferenceDays || modifiedEmployees || modifiedAbsences) {
    scheduleNightShiftRemainingDays(newSchedule, workday, prevDay2, prevDay, currentDay);
  }
}

/** Assigns the most suitable employee to work the day shift of the remaining days. */
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

/** Assigns the most suitable employee to work the night shift of remaining days. */
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

/** Exports the computed schedule into a .xml file. */
function exportScheduleToExcel(elem) {
  let table = document.getElementById("scheduleTbl");
  let html = table.outerHTML;
  let url = 'data:application/vnd.ms-excel,' + escape(html); 
  elem.setAttribute("href", url);
  elem.setAttribute("download", "Program_Paza_" + startDate + '-' + endDate + ".xls");
  return false;
}

/** Updates the old key of the employee object with the new key. */
function updateEmployeesObjectKey(obj, oldKey, newKey) {
  if (oldKey !== newKey) {
    Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, oldKey));
    delete obj[oldKey];
  }
}

/*
    VALIDATION & ERROR HANDLING FUNCTIONS
*/

/** Throws an alert if no employee can be assigned to a shift. */
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

/** Return true if dates pass all validation conditions. */
function validateDates(startDate, endDate) {
  if (checkEmptyDates(startDate, endDate) &&
    checkDaysInDate(startDate) &&
    checkDaysInDate(endDate) &&
    checkMonthInDate(startDate) &&
    checkMonthInDate(endDate) &&
    checkStartDateBiggerThanEndDate(startDate, endDate)) {
    return true
  } else {
    return false
  }
}

/** Returns true if date is not empty. */
function checkEmptyDates(startDate, endDate) {
  if (startDate == "" || endDate == "") {
    alert("Completați datele programului.")
    return false;
  } else {
    return true;
  }
}

/** Returns false if the start date is bigger than the end date. */
function checkStartDateBiggerThanEndDate(startDate, endDate) {
  let parsedStartDate = new Date(getParsedDate(startDate));
  let parsedEndDate = new Date(getParsedDate(endDate));

  if (parsedStartDate >= parsedEndDate) {
    alert('Data de început nu poate fi mai mare sau egală cu data de sfârșit')
    return false;
  } else {
    return true;
  }
}

/** Returns false if number of days is invalid. */
function checkDaysInDate(date) {
  let splitDate = date.split('.');
  let day = splitDate[0];
  let month = splitDate[1];
  let year = splitDate[2];
  let daysInMonth = getDaysInMonth(month, year);
  let monthIndex = getMonth(month, year)

  if (parseInt(day) > parseInt(daysInMonth)) {
    alert('Luna ' + months[monthIndex] + ' a anului ' + year + ' poate avea maximum ' + daysInMonth + ' zile.');
    return false;
  } else {
    return true;
  }
}

/** Returns false if month is invalid. */
function checkMonthInDate(date) {
  let splitDate = date.split('.');
  let month = splitDate[1];

  if (parseInt(month) > months.length) {
    alert('Anul poate avea doar 12 luni.');
    return false
  } else {
    return true
  }
}

/** Changes an old key with a new one, returning a new object with keys in the same order. */
function updateObjectKey(oldValue, newValue, obj) {
  let entryKeys =  Object.keys(obj);
  let entryValues = Object.values(obj);
  let indexOfOldValue = entryKeys.indexOf(oldValue)
  let newObj = {};
  entryKeys[indexOfOldValue] = newValue;

  for(i = 0; i < entryKeys.length; i++) {
    newObj[entryKeys[i]] = entryValues[i];
  };

  return newObj
}

/*
    TEST FUNCTIONS
*/

/** Tests if the schedule follows rquested rules */
function testSchedule(testSchedule) {
  let workdaysKeys = Object.keys(testSchedule);
  let dayShifts = [];
  let nightShifts = [];
  let problemShiftsArray = [];
  let problemShiftsUnique = [];

  Object.entries(testSchedule).map((element) => {
    let workday = element[0];
    let dayShift = element[1][DAY];
    let nightShift = element[1][NIGHT];
    let workdayIndex = workdaysKeys.indexOf(workday);
    let currentDay = Object.entries(testSchedule)[workdayIndex];
    let prevDay = Object.entries(testSchedule)[workdayIndex - 1];
    let prevDay2 = Object.entries(testSchedule)[workdayIndex - 2];

    if (workdayIndex == 0) {
      if (dayShift == "" || dayShift == undefined) {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
        problemShiftsArray.push(workday);
      } else {
        console.log(workday + ' ' + DAY + ' shift: ' + dayShift);
        dayShifts.push([workday, [DAY, dayShift]]);
      }

      if (nightShift == "" || nightShift == undefined) {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED');
        problemShiftsArray.push(workday);
      } else {
        if (dayShift == nightShift) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT');
          problemShiftsArray.push(workday);
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift);
          nightShifts.push([workday, [NIGHT, nightShift]]);
        }
      }
    } else if (workdayIndex == 1) {
      if (dayShift == "" || dayShift == undefined) {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
        problemShiftsArray.push(workday);
      } else {
        if (Object.values(prevDay[1]).includes(dayShift)) {
          console.log('ERROR: ' + workday + ' ' + DAY + ' shift = ' + dayShift + ' INCORRECT ASSIGNMENT');
          problemShiftsArray.push(workday);
        } else {
          console.log(workday + ' ' + DAY + ' shift: ' + dayShift);
          dayShifts.push([workday, [DAY, dayShift]]);
        }
      }

      if (nightShift == "" || nightShift == undefined) {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED');
        problemShiftsArray.push(workday);
      } else {
        if ([prevDay[1][NIGHT], currentDay[1][DAY]].includes(nightShift)) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT');
          problemShiftsArray.push(workday);
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift);
          nightShifts.push([workday, [NIGHT, nightShift]]);
        }
      }
    } else {
      if (dayShift == "" || dayShift == undefined) {
        console.log('ERROR: ' + workday + ' ' + DAY + ' shift = NOT COVERED');
        problemShiftsArray.push(workday);
      } else {
        if (!checkDayShiftAvailability(dayShift, prevDay, prevDay2)) {
          console.log('ERROR: ' + workday + ' ' + DAY + ' shift = ' + dayShift + ' INCORRECT ASSIGNMENT');
          problemShiftsArray.push(workday);
        } else {
          console.log(workday + ' ' + DAY + ' shift: ' + dayShift);
          dayShifts.push([workday, [DAY, dayShift]]);
        }
      }

      if (nightShift == "" || nightShift == undefined) {
        console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = NOT COVERED');
        problemShiftsArray.push(workday);
      } else {
        if (!checkNightShiftAvailability(nightShift, currentDay, prevDay, prevDay2)) {
          console.log('ERROR: ' + workday + ' ' + NIGHT + ' shift = ' + nightShift + ' INCORRECT ASSIGNMENT');
          problemShiftsArray.push(workday);
        } else {
          console.log(workday + ' ' + NIGHT + ' shift: ' + nightShift);
          nightShifts.push([workday, [NIGHT, nightShift]]);
        }
      }
    }
  })

  problemShiftsArray.map((workday) => {
    if (!problemShiftsUnique.includes(workday)) {
      problemShiftsUnique.push(workday);
    }
  });

  if (problemShiftsUnique.length > 0) {
    alert('Programul generat nu respectă regulile în vigoare. Verificați datele programului pentru urmatoarele zile: ' + problemShiftsUnique);
  } else {
    confirm('Programul a fost generat succes.');
  }

}