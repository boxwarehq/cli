import {Command, flags} from '@oclif/command'
// import * as shell from 'shelljs'
import cli from 'cli-ux'
import * as notifier from 'node-notifier'

// import inquirer from 'inquirer'

export default class Install extends Command {
    static description = 'install software from the Boxware store'
  
    static examples = [
      `$ boxware install
  boxware install <package>
  `,
    ]
  
    static flags = {
        help: flags.help({char: 'h'}),
        // flag with a value (-n, --name=VALUE)
    }
  
    static args = [{name: 'pkgName'}]
    
    async run() {
        const {args} = this.parse(Install)
        cli.action.start('Installing')
        if(true) {
            const shell = require("shelljs")
            shell.exec("wget https://cdn.boxware.io/packages/" + args.pkgName + ".sh")
            shell.exec("bash " + args.pkgName + ".sh")
            shell.rm(args.pkgName + ".sh")
        }
        await cli.action.stop('done!')
        notifier.notify({
            title: 'Package installed!',
            message: args.pkgName + " has been installed"
        })
    }
}
