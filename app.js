const inquirer = require('inquirer')
const mysql = require('mysql2')
const db = mysql.createConnection('mysql://root:rootroot@localhost:3306/employees_db')
require('console.table')

// ask again

// make some dummy data

// view function
const view = _ => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      choices: ['All Employees', 'Employees By Department', 'Employees by Manager', 'Go Back <-'],
      message: 'What would you like to view?'
    }
  ])
    .then(({ action }) => {
      switch (action) {
        case 'All Employees':
          db.query('SELECT * FROM employees', (err, employees) => {
            if (err) {
              console.log(err)
            }
            console.table(employees)
          })
          break
        case 'Employees By Department':
          // potentially another query where they select by dpt.
          break
        case 'Employees by Manager':
          // query where they select by manager
          break
        case 'Go Back <-':
          ask()
          break
        default:
          console.log('error in view switch.')
          break
      }
    })
    .catch(err => console.log(err))
}

// view budget of a dpt, add to view?

// add function
const add = _ => {
  // a
}

// remove function
const rm = _ => {
  // a
}

// update employee role
// update employee manager
const update = _ => {
  // a
}

// ask
// prompt to add, view, or update
const ask = _ => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      choices: ['View Employees', 'Add Employee', 'Remove', 'Update Employee']
    }
  ])
    .then(({ action }) => {
      switch (action) {
        case 'View Employees':
          view()
          break
        case 'Add Employee':
          add()
          break
        case 'Remove':
          rm()
          break
        case 'Update Employee':
          update()
          break
        default:
          console.log('error in action switch in ask function')
          break
      }
    })
    .catch(err => console.log(err))
}
ask()
