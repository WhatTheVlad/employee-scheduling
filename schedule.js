
/*
    Mock Variables
*/

const emptySchedule = {
    '01.01.2020': {
        'day': '',
        'night': ''
    },
    '02.01.2020': {
        'day': '',
        'night': ''
    },
    '03.01.2020': {
        'day': '',
        'night': ''
    },
    '04.01.2020': {
        'day': '',
        'night': ''
    },
    '05.01.2020': {
        'day': '',
        'night': ''
    }
}
const employeeList = ['Emp 1', 'Emp 2', 'Emp 3', 'Emp 4'];


/*
    App Variables
*/
const DAY = 'day';
const NIGHT = 'night';

/*
    Util Functions
*/

// Main function. Computes schedule according to all rules and filters.
function computeSchedule(initialSchedule, employee) {
    let newSchedule = initialSchedule;
    let workdaysKeys = Object.keys(initialSchedule);

    Object.entries(newSchedule).map(element => {

        let workday = element[0];
        let dayShift = element[1][DAY];
        let nightShift = element[1][NIGHT];
        let workdayIndex = workdaysKeys.indexOf(workday)
        let currentDay = Object.entries(newSchedule)[workdayIndex];
        let prevDay = Object.entries(newSchedule)[workdayIndex - 1];
        let prevDay2 = Object.entries(newSchedule)[workdayIndex - 2];

        if (workdayIndex > 1) {
            if (dayShift == '') {
                let canEmpWorkDay = checkDayShiftAvailability(employee, prevDay, prevDay2);
                if (canEmpWorkDay) {
                    newSchedule[workday][DAY] = employee;
                }
            }

            if (nightShift == '') {
                let canEmpWorkNight = checkNightShiftAvailability(employee, currentDay, prevDay, prevDay2);
                if (canEmpWorkNight) {
                    newSchedule[workday][NIGHT] = employee;
                }
            }
        }
    })
    return newSchedule;
}

/** Checks employee availability for day shifts */
function checkDayShiftAvailability(employee, prevDay, prevDay2) {
    let prevDayShifts = prevDay[1];
    let prevDay2Shifts = prevDay2[1];
    let restShifts = [prevDayShifts[NIGHT], prevDayShifts[DAY], prevDay2Shifts[NIGHT]]

    if (!restShifts.includes(employee)) {
        return true
    } else {
        return false
    }
}

/** Checks employee availability for night shifts */
function checkNightShiftAvailability(employee, currentDay, prevDay, prevDay2) {

    let currentDayShifts = currentDay[1];
    let prevDayShifts = prevDay[1];
    let prevDay2Shifts = prevDay2[1];
    let restShifts = [currentDayShifts[DAY], prevDayShifts[NIGHT], prevDay2Shifts[NIGHT]];

    if (!restShifts.includes(employee)) {
        return true
    } else {
        return false
    }
}

//Schedules employees for the first two days
function scheduleFirstTwoDays(schedule, firstDay, secondDay, emp1, emp2, emp3) {
    schedule[firstDay][DAY] = emp1;
    schedule[firstDay][NIGHT] = emp2;
    schedule[secondDay][DAY] = emp3;
    schedule[secondDay][NIGHT] = emp1;

    return schedule
}

/*
    Execution
*/

scheduleFirstTwoDays(emptySchedule, '01.01.2020', '02.01.2020', 'Emp1', 'Emp2', 'Emp3')
computeSchedule(emptySchedule, 'Emp1');
computeSchedule(emptySchedule, 'Emp2');
computeSchedule(emptySchedule, 'Emp3');
computeSchedule(emptySchedule, 'Emp4');

console.log(emptySchedule)








