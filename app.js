const inquirer = require('inquirer')
const mysql = require('mysql2')
const db = mysql.createConnection('mysql://root:rootroot@localhost:3306/employees_db')
require('console.table')

// ask again
const askAgain = _ => {
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'cont',
      message: 'Would you like to make another query?'
    }
  ])
    .then(({ cont }) => {
      if (cont) {
        ask()
      } else {
        process.exit()
      }
    })
    .catch(err => console.log(err))
}

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

// view function // add view all roles, and add view all dpt
const view = _ => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      choices: ['All Employees', 'All Roles', 'All Departments', 'Employees By Department', 'Employees by Manager', 'Budget', 'Go Back <-'],
      message: 'What would you like to view?'
    }
  ])
    .then(({ action }) => {
      switch (action) {
        case 'All Employees':
          // edit this to be a join with dpt and role
          db.query(`
            SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
            FROM employee
            LEFT JOIN role
            ON employee.role_id = role.id
            LEFT JOIN department
            ON role.department_id = department.id
            LEFT JOIN employee manager
            ON manager.id = employee.manager_id;
          `, (err, employee) => {
            if (err) {
              console.log(err)
            }
            console.table(employee)
            askAgain()
          })
          break
        case 'All Roles':
          // all roles
          db.query('SELECT * FROM role', (err, roles) => {
            if (err) {
              console.log(err)
            }
            console.table(roles)
            askAgain()
          })
          break
        case 'All Departments':
          // all dpt
          db.query('SELECT * FROM department', (err, dpts) => {
            if (err) {
              console.log(err)
            }
            console.table(dpts)
            askAgain()
          })
          break
        case 'Employees By Department':
          // potentially another query where they select by dpt.
          db.query(`
            SELECT department.name AS department, CONCAT(employee.first_name, ' ', employee.last_name) AS name
            FROM department
            LEFT JOIN role
            ON department.id = role.department_id
            RIGHT JOIN employee
            ON role.id = employee.role_id
          `, (err, employee) => {
            if (err) {
              console.log(err)
            }
            console.table(employee)
            askAgain()
          })
          break
        case 'Employees by Manager':
          // query where they select by manager
          db.query(`
            SELECT CONCAT(manager.first_name, ' ', manager.last_name) AS manager, CONCAT(employee.first_name, ' ', employee.last_name) AS name
            FROM employee manager
            INNER JOIN employee
            on manager.id = employee.manager_id
          `, (err, managers) => {
            if (err) {
              console.log(err)
            }
            console.table(managers)
            askAgain()
          })
          askAgain()
          break
        case 'Budget':
          // list of departments, display employees associated with inner join, add salaries.
          calcBudget()
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
const calcBudget = _ => {
  getDpt()
    // declare array to be parsed by inquirer
    .then((departments) => {
      const dptArray = departments.map((department) => ({
        name: department.name,
        value: department.id
      }))
      // prompt
      inquirer.prompt([
        {
          type: 'list',
          name: 'id',
          choices: dptArray,
          message: 'Which department would you like to see the budget of?'
        }
      ])
        .then(({ id }) => {
          db.query(`
            SELECT department.name AS department, CONCAT(employee.first_name, ' ', employee.last_name) AS name, role.salary
            FROM employee
            LEFT JOIN role
            ON role.id = employee.role_id
            INNER JOIN department
            ON department.id = role.department_id
            WHERE department.id = ${id}
          `, (err, salaries) => {
            if (err) {
              console.log(err)
            }
            if (salaries === []) {
              console.log('') // show if empty stuff here
            } else {
              let sum = 0
              salaries.forEach((person) => {
                sum += parseInt(person.salary)
              })
              console.log(`The total budget of the ${salaries[0].department} department is $${sum}.\n`)
              askAgain()
            }
            // console.log(salaries)
          })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

// add prompt
const add = _ => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      choices: ['Add Employee', 'Add Role', 'Add Department', 'Go Back <-'],
      mesasge: 'What would you like to add?'
    }
  ])
    .then(({ choice }) => {
      switch (choice) {
        case 'Add Employee':
          addEmployee()
          break
        case 'Add Role':
          addRole()
          break
        case 'Add Department':
          addDpt()
          break
        default:
          ask()
          break
      }
    })
    .catch(err => console.log(err))
}
// add functions for adding departments
const addDpt = _ => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the new department?'
    }
  ])
    .then((answer) => {
      db.query('INSERT INTO department SET ?', answer, err => {
        if (err) {
          console.log(err)
        }
        console.log('Department added!')
      })
    })
  askAgain()
}
// add for role
const addRole = _ => {
  getDpt()
    .then((departments) => {
      const dptArray = departments.map((department) => ({
        name: department.name,
        value: department.id
      }))
      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'What is the title of the new role?'
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary of the new role?'
        },
        {
          type: 'list',
          name: 'department_id',
          choices: dptArray,
          message: 'What department does the new role belong to?'
        }
      ])
        .then((answer) => {
          db.query('INSERT INTO role SET ?', answer, err => {
            if (err) { console.log(err) }
          })
          askAgain()
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

// add employee function..
const addEmployee = _ => {
  getEmployees()
    .then((managers) => {
      // map managers into parsable array for prompt
      const managersArray = managers.map((manager) => ({
        name: `${manager.first_name} ${manager.last_name}`,
        value: manager.id
      }))
      // add no manager option
      managersArray.push({
        name: 'No Manager',
        value: null
      })
      getRoles()
        .then((roles) => {
          // map roles into parsable array for prompt
          const rolesArray = roles.map((role) => ({
            name: role.title,
            value: role.id
          }))

          inquirer.prompt([
            {
              type: 'input',
              name: 'first_name',
              message: 'What is the new employee\'s first name?'
            },
            {
              type: 'input',
              name: 'last_name',
              message: 'What is the new employee\'s last name?'
            },
            {
              type: 'list',
              name: 'role_id',
              choices: rolesArray,
              message: 'What is the new employee\'s role?'
            },
            {
              type: 'list',
              name: 'manager_id',
              choices: managersArray,
              message: 'Who is the new employee\'s manager?'
            }
          ])
            .then((answer) => {
              // add into employee db now
              db.query('INSERT INTO employee SET ?', answer, err => {
                if (err) {
                  console.log(err)
                }
                console.log('Employee added!')
                askAgain()
              })
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}
// end add

// remove function
const rm = _ => {
  getEmployees()
    .then((employees) => {
      const employeesArray = employees.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }))
      // add an option to back out of deleting
      employeesArray.push({
        name: 'Go back <-',
        value: null
      })
      inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          choices: employeesArray,
          message: 'Which employee would you like to delete?'
        }
      ])
        .then(({ choice }) => {
          if (choice === null) {
            ask()
          } else {
            const condition = {
              id: choice
            }
            db.query('DELETE FROM employee WHERE ?', condition, err => {
              if (err) {
                console.log(err)
              }
              console.log('Employe deleted.')
              askAgain()
            })
          }
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
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
                        askAgain()
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
                        askAgain()
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
}
// END UPDATE

// ask
// prompt to add, view, or update
const ask = _ => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      choices: ['View', 'Add', 'Remove', 'Update Employee']
    }
  ])
    .then(({ action }) => {
      switch (action) {
        case 'View':
          view()
          break
        case 'Add':
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
