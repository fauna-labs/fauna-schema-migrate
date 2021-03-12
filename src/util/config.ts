import path from 'path'
import * as files from './files'
import defaults from './defaults'
import { existsSync } from 'fs'

export class Config {
  config: any
  defaultConfigString = ''

  constructor() {
    this.defaultConfigString = `{
            "directories": {
                "root": "${defaults.directories.root}",
                "resources": "${defaults.directories.resources}",
                "migrations": "${defaults.directories.migrations}",
                "children": "${defaults.directories.children}",
                "temp": "${defaults.directories.temp}"
            },
            "collection": "${defaults.collection}"
    }`
  }

  configDefault() {
    return `module.exports = ${this.defaultConfigString} `
  }

  async readConfig() {
    // caching at this point. Remove the cache to have live updates and read the config each time.
    if (this.config) {
      return (await this.config).default
    } else {
      if (existsSync(path.join(process.cwd(), defaults.configFile))) {
        this.config = await import(path.join(process.cwd(), defaults.configFile))
        return (await this.config).default
      } else {
        return JSON.parse(this.defaultConfigString)
      }
    }
  }

  async writeConfig() {
    const content = this.configDefault()
    const p = path.join(defaults.configFile)
    if (existsSync(p)) {
      return false
    } else {
      const fullPath = await files.writeApplicationFile(p, content)
      return fullPath
    }
  }

  async getMigrationsDir() {
    return path.join(
      await this.getConfigVar(await this.readConfig(), ['directories', 'root']),
      await this.getConfigVar(await this.readConfig(), ['directories', 'migrations'])
    )
  }

  async getResourcesDir() {
    return path.join(
      await this.getConfigVar(await this.readConfig(), ['directories', 'root']),
      await this.getConfigVar(await this.readConfig(), ['directories', 'resources'])
    )
  }

  async getMigrationCollection() {
    return await this.getConfigVar(await this.readConfig(), ['collection'])
  }

  async getTempDir() {
    return path.join(
      await this.getConfigVar(await this.readConfig(), ['directories', 'root']),
      await this.getConfigVar(await this.readConfig(), ['directories', 'temp'])
    )
  }

  async getChildDbsDir() {
    return path.join(
      await this.getConfigVar(await this.readConfig(), ['directories', 'root']),
      await this.getConfigVar(await this.readConfig(), ['directories', 'resources']),
      await this.getConfigVar(await this.readConfig(), ['directories', 'children'])
    )
  }

  async getChildDbsDirName() {
    return await this.getConfigVar(await this.readConfig(), ['directories', 'children'])
  }

  async getConfigVar(config: any, configPath: string[]): Promise<string> {
    try {
      let value: any = config[configPath[0]]
      configPath.forEach((nextAttribute: string, index: number) => {
        if (index !== 0) {
          value = value[nextAttribute]
        }
      })
      if (value !== undefined) {
        return value
      }
      return this.getConfigVar(defaults, configPath)
    } catch (err) {
      // else return defaults if config is absent or value is absent.
      return this.getConfigVar(defaults, configPath)
    }
  }
}

export const config = new Config()
