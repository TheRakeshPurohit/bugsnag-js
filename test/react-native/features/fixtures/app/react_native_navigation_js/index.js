import { Navigation } from 'react-native-navigation'
import HomeScreen from './screens/Home'
import DetailsScreen from './screens/Details'
import { NativeModules, View, Text, Button, TextInput, StyleSheet } from 'react-native'
import * as React from 'react'
import Bugsnag from '@bugsnag/react-native'
import * as Scenarios from './Scenarios'
import BugsnagReactNativeNavigation from '@bugsnag/plugin-react-native-navigation'
import { Component } from 'react'

const defaultJsConfig = () => ({
  plugins: [new BugsnagReactNativeNavigation(Navigation)]
})

export default class AppScreen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      currentScenario: '',
      apiKey: '12312312312312312312312312312312',
      notifyEndpoint: 'http://bs-local.com:9339/notify',
      sessionsEndpoint: 'http://bs-local.com:9339/sessions',
      scenario: null
    }
  }

  getConfiguration = () => {
    return {
      apiKey: this.state.apiKey,
      endpoints: {
        notify: this.state.notifyEndpoint,
        sessions: this.state.sessionsEndpoint
      },
      autoTrackSessions: false
    }
  }

  startScenario = () => {
    console.log(`Running scenario: ${this.state.currentScenario}`)
    const scenarioName = this.state.currentScenario
    const configuration = this.getConfiguration()
    const jsConfig = defaultJsConfig()
    const scenario = new Scenarios[scenarioName](configuration, jsConfig)
    console.log(`  with config: ${JSON.stringify(configuration)} (native) and ${jsConfig} (js)`)
    NativeModules.BugsnagTestInterface.startBugsnag(configuration)
      .then(() => {
        Navigation.setRoot({
          root: {
            stack: {
              children: [
                {
                  component: {
                    name: 'Home'
                  }
                }
              ]
            }
          }
        })
        Bugsnag.start(jsConfig)
        this.state.scenario = scenario
        scenario.run()
      })
  }

  startBugsnag = () => {
    console.log(`Starting Bugsnag for scenario: ${this.state.currentScenario}`)
    const scenarioName = this.state.currentScenario
    const configuration = this.getConfiguration()
    const jsConfig = defaultJsConfig()
    const scenario = new Scenarios[scenarioName](configuration, jsConfig)
    console.log(`  with config: ${JSON.stringify(configuration)} (native) and ${jsConfig} (js)`)
    NativeModules.BugsnagTestInterface.startBugsnag(configuration)
      .then(() => {
        Bugsnag.start(jsConfig)
        this.state.scenario = scenario
      })
  }

  runCommand = async () => {
    const response = await global.fetch('http://bs-local.com:9339/command')
    console.log(`Received command: ${response}`)
    const responseJson = await response.json()

    this.setState({
      currentScenario: responseJson.scenario_name
    })
    switch (responseJson.action) {
      case 'run_scenario':
        await this.startScenario()
        break
      case 'start_bugsnag':
        await this.startBugsnag()
        break
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={styles.child}>
          <Text>React Native Navigation Test App</Text>
          <TextInput style={styles.textInput}
            placeholder='Scenario Name'
            accessibilityLabel='scenario_name'
            value={this.state.currentScenario} />
          <Button style={styles.clickyButton}
            accessibilityLabel='run_command'
            title='Run Command'
            onPress={this.runCommand}/>

          <Text>Configuration</Text>
          <TextInput placeholder='Notify endpoint'
            style={styles.textInput}
            accessibilityLabel='notify_endpoint'
            value={this.state.notifyEndpoint}
            onChangeText={this.setNotifyEndpoint} />
          <TextInput placeholder='Sessions endpoint'
            style={styles.textInput}
            accessibilityLabel='sessions_endpoint'
            value={this.state.sessionsEndpoint}
            onChangeText={this.setSessionsEndpoint} />
          <TextInput placeholder='API key'
            style={styles.textInput}
            accessibilityLabel='api_key'
            value={this.state.apiKey}
            onChangeText={this.setApiKey} />
          <Button style={styles.clickyButton}
            accessibilityLabel='use_dashboard_endpoints'
            title='Use dashboard endpoints'
            onPress={this.useRealEndpoints}/>
        </View>
      </View>
    )
  }
}

Navigation.registerComponent('App', () => AppScreen)
Navigation.registerComponent('Home', () => HomeScreen)
Navigation.registerComponent('Details', () => DetailsScreen)
Navigation.events().registerAppLaunchedListener(async () => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: 'App'
            }
          }
        ]
      }
    }
  })
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#eaefea',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '15%'
  },
  child: {
    flex: 1
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#000',
    borderRadius: 4,
    margin: 5,
    padding: 5
  },
  clickyButton: {
    backgroundColor: '#acbcef',
    borderWidth: 0.5,
    borderColor: '#000',
    borderRadius: 4,
    margin: 5,
    padding: 5
  }
})
