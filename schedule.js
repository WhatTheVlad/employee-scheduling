

/*
    Mock Variables
*/

let prevDayObj = {
    '01.01.2020': {
        'day': 'Emp1',
        'night': ''
    }
}

let prevDay2Obj = {
    '02.01.2020': {
        'day': '',
        'night': ''
    }
}

let emptySchedule = {
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
let employeeList = ['Emp 1', 'Emp 2', 'Emp 3', 'Emp 4'];


/*
    App Variables
*/
let finalSchedule;


/*
    Util Functions
*/

// Main function. Computes schedule according to all rules and filters.
function computeSchedule(emptySchedule, employeeList) {
    let newSchedule = emptySchedule;
    let workdaysEntries = Object.entries(emptySchedule);
    let workdaysKeys = Object.keys(emptySchedule);

    Object.entries(emptySchedule).map(element => {

        let workday = element[0];
        let dayShift = element[1].day;
        let nightShift = element[1].night;
        let workdayIndex = workdaysKeys.indexOf(workday)

        if (workdayIndex > 1) {
            if (dayShift == '') {
                let canEmpWork = checkRestTimeForDay('Emp1', prevDayObj, prevDay2Obj);
                if (canEmpWork) {
                    newSchedule[workday]['day'] = employeeList[0]
                }
            }

            if (nightShift == '') {
                //nightShift = employeeList[0];
            }
        }
    })

}

/** Checks employee availability for a day shift */
function checkRestTimeForDay(employee, prevDayObj, prevDay2Obj) {

    let prevDayShifts = Object.entries(prevDayObj[Object.keys(prevDayObj)[0]]);
    let prevDay2Shifts = Object.entries(prevDay2Obj[Object.keys(prevDay2Obj)[0]]);
    let restShifts = [prevDayShifts[0], prevDayShifts[1], prevDay2Shifts[1]]

    restShifts.forEach(shift => {
        if (shift[1] == employee) {
            return false;
        }
    });

    return true;
}

/** Checks employee availability for a night shift */
function checkRestTimeForNight(employee, prevDayObj, prevDay2Obj) {

    let prevDayShifts = Object.entries(prevDayObj[Object.keys(prevDayObj)[0]]);
    let prevDay2Shifts = Object.entries(prevDay2Obj[Object.keys(prevDay2Obj)[0]]);
    let restShifts = [prevDayShifts[0], prevDayShifts[1], prevDay2Shifts[1]]

    restShifts.forEach(shift => {
        if (shift[1] == employee) {
            return false;
        }
    });

    return true;
}


/*
    Execution
*/


computeSchedule(emptySchedule, employeeList);