const inquirer = require('inquirer')
const mysql = require('mysql2')
const db = mysql.createConnection('mysql://root:rootroot@localhost:3306/employees_db')
require('console.table')

// ask again

// get employees
async function getEmployees () {
  const response = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM employee', (err, employee) => {
      if (err) {
        reject(err)
      }
      resolve(employee)
    })
  })
  return response
}

// get roles
async function getRoles () {
  const response = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM role', (err, role) => {
      if (err) {
        reject(err)
      }
      resolve(role)
    })
  })
  return response
}

// get departments
async function getDpt () {
  const response = await new Promise((resolve, reject) => {
    db.query('SELECT * FROM department', (err, department) => {
      if (err) {
        reject(err)
      }
      resolve(department)
    })
  })
  return response
}

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
          // edit this to be a join with dpt and role
          db.query(`
          SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name
          FROM employee
          LEFT JOIN role
          ON employee.role_id = role.id
          LEFT JOIN department
          ON role.department_id = department.id;
          `, (err, employee) => {
            if (err) {
              console.log(err)
            }
            console.table(employee)
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
  // get array of existing employees using helper function
  getEmployees()
    .then(employees => {
      // prompt for who to update
      inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          choices: employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          })),
          message: 'Who would you like to update?'
        },
        {
          type: 'list',
          name: 'updateType',
          choices: ["Employee's Role", "Employee's Manager"],
          message: 'What would you like to update?'
        }
      ])
        .then((answer) => {
          switch (answer.updateType) {
            case "Employee's Role":
              // display a list of roles
              getRoles()
                .then((roles) => {
                  // prompt for what role to select
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'newRole',
                      choices: roles.map((role) => ({
                        name: role.title,
                        value: role.id
                      })),
                      message: 'What role would you like to give the employee?'
                    }
                  ])
                    .then(({ newRole }) => {
                      // update condition
                      const condition = [
                        {
                          role_id: newRole
                        },
                        {
                          id: answer.choice
                        }
                      ]
                      // update query
                      db.query('UPDATE employee SET ? WHERE ?', condition, err => {
                        if (err) {
                          console.log(err)
                        }
                        console.log('updated!')
                      })
                    })
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
              break
            case "Employee's Manager":
              // display a list of employees(?)
              getEmployees()
                .then((managers) => {
                  const managersArray = managers.map((manager) => ({
                    name: manager.first_name + ' ' + manager.last_name,
                    value: manager.id
                  }))
                  managersArray.push(({
                    name: 'No Manager',
                    value: null
                  }))

                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'choice',
                      choices: managersArray,
                      message: 'Select a manager.'
                    }
                  ])
                    .then(({ choice }) => {
                      // update
                      const condition = [
                        {
                          manager_id: choice
                        },
                        {
                          id: answer.choice
                        }
                      ]
                      db.query('UPDATE employee SET ? WHERE ?', condition, err => {
                        if (err) {
                          console.log(err)
                        }
                        console.log('updated!')
                      })
                    })
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
              break
            default:
              console.log('Error in update switch statement')
              break
          }
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))

  //
  // db.query('UPDATE employee SET ? WHERE ?', condition, err => {
  //   if (err) {
  //     console.log(err)
  //   }
  // })
  //
}
// END UPDATE

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
