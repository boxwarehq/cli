import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import chalk from 'chalk'

export default class Init extends Command {
    static description = 'intialize Boxware in your repository'
  
    static examples = [
      `$ boxware init
  Hey there! Let's initialize Boxware in your repository
  `,
    ]
  
    static flags = {
        help: flags.help({char: 'h'}),
        name: flags.string({char: 'n', description: 'name to print'}),
        force: flags.boolean({char: 'f'}),
    }

    static args = [{name: 'file'}]
    
    async run() {
        var pkgName, pkgVersion, pkgDescription, pkgRepo, boxwareTemplate, folder, hardware
        this.log(`${chalk(`${chalk.white.bold(`Welcome to the Boxware CLI!`)}\n\nThis is a guide to automatically create your ${chalk.cyan.bold(`boxware.json`)} app manifest file and the markdown text you need to insert the ${chalk.cyan.bold(`Try on Boxware`)} button in your GitHub README.md. This will allow people to try and use your software in their browser without downloading/installing anything.\nMake sure you've cloned and entered your repository before continuing.`)}\n\n${chalk.white(`You can press CTRL+C at any time to quit.`)}\n`)
        let questions = [
            {
                type: 'input',
                name: 'pkgName',
                message: "What's your package's name?"
            },
            {
                type: 'input',
                name: "pkgVersion",
                message: "What's your package's version?",
                validate: function(value : any) {
                    var pass = value.match(/^(\d+\.)?(\d+\.)?(\*|\d+)$/g);
                    if (pass) {return true;}
                    return 'Please enter a valid version number';
                },
                default: '1.0.0'
            },
            {
                type: 'input',
                name: 'pkgDescription',
                message: "Write a description for your package"
            },
            {
                type: 'input',
                name: 'pkgRepoOwner',
                message: 'Owner of the GitHub repository (https://github.com/OWNER/repo)',
                validate: function(value : any) {
                    var pass = value.match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);
                    if (pass) {return true;}
                    return 'Please enter a valid GitHub username';
                }
            },
            {
                type: 'input',
                name: 'pkgRepoName',
                message: 'Name of the GitHub repository (https://github.com/owner/REPO)',
                validate: function(value : any) {
                    var pass = value.match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);
                    if (pass) {return true;}
                    return 'Please enter a valid GitHub repository name';
                }
            },
            {
                type: 'input',
                name: 'boxwareTemplate',
                message: 'Which Boxware template should we use for your package?',
                default: 'boxware/ubuntu-base'
            },
            {
                type: 'input',
                name: 'folder',
                message: 'Which desktop folder should we clone the repository into?',
                default: '~/'
            },
            {
                type: 'input',
                name: 'hardware',
                message: 'What hardware type does your package need?',
                default: 't2.medium'
            }
        ]
        const prompt : any = await inquirer.prompt(questions)
        pkgName = prompt.pkgName
        pkgVersion = prompt.pkgVersion
        pkgDescription = prompt.pkgDescription
        pkgRepo = prompt.pkgRepo
        boxwareTemplate = prompt.boxwareTemplate
        folder = prompt.folder
        hardware = prompt.hardware
        pkgRepo = `https://github.com/${prompt.pkgRepoOwner}/${prompt.pkgRepoName}`

        let data = { 
            "name": pkgName, 
            "version": pkgVersion,
            "description": pkgDescription, 
            "repository": pkgRepo,
            "image" : boxwareTemplate,
            "folder" : folder,
            "hardware": hardware,
            "commands" :  ['']
        }
        var cmd
        var i = 0
        while(cmd !== "n" && cmd !== "N") {
            cmd = await cli.prompt(`${chalk.green('?')} ${chalk.white.bold('Commands to run after cloning repo (N to end)')}`)
            if(cmd !== "n" && cmd !== "N") {
                data.commands[i] = cmd
                i++
            }
            else {
                break
            }
        }
        this.log(`${chalk.yellow.bold('[Info]')} ${chalk.white.bold('Your boxware.json file:\n')}`)
        var betterData = JSON.stringify(data, null, 4)
        this.log(betterData+"\n")
        const response = await inquirer.prompt([{type: "confirm", name: "confirm", message: "Is this correct", default: true}])
        if(response) {
            fs.writeFile("./boxware.json", betterData, function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log(`${chalk.green.bold('[Success]')} ${chalk.white.bold('boxware.json generated successfully!')}`);
                console.log(`${chalk.yellow.bold('[Info]')} ${chalk.white.bold(`To put the ${chalk.cyan.bold(`Try on Boxware`)} button, insert the following markdown text`)}`)
                console.log(`${chalk.yellow.bold('[Info]')} ${chalk.white.bold('into README.md inside your repository and push your changes.\n')}`)
                console.log(`${chalk.yellow.bold('[Info]')} ${chalk(`[![Try on Boxware](https://cdn.boxware.io/try/button.svg)](https://boxware.io/dashboard?try=${data.repository})\n`)}`)
                const copy = inquirer.prompt([{type: "confirm", name: "confirm", message: "Do you want to copy this to your clipboard?", default: true}])
                if(copy) {
                    const clipboardy = require('clipboardy');
                    clipboardy.writeSync(`[![Try on Boxware](https://cdn.boxware.io/try/button.svg)](https://boxware.io/dashboard?try=${data.repository})`);
                }
            })
        } 
        else if(!response) {
            this.exit(0)
        }
    }
}
