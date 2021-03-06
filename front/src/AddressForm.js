import { bind } from 'decko'
import React, { Component } from 'react'
import Error from './Error'
import Suggestions from './Suggestions'

export default class AddressForm extends Component {
  constructor(props) {
    const inputs = {
      'houseNumbers': {
        handle: props.onHouseNumberChange,
        suggestions: [],
      },
      'additionals': {
        handle: props.onAdditionalChange,
        suggestions: [],
      },
      'streets': {
        handle: props.onStreetChange,
        suggestions: [],
      },
    }
    super(props)
    this.state = {
      inputs,
      activeInput: inputs.houseNumbers,
    }
  }

  componentDidMount() {
    this.getHouseNumbersSuggestions(),
    this.getAdditionalsSuggestions()
    this.getStreetsSuggestions()
  }

  @bind
  getHouseNumbersSuggestions() {
    const { inputs } = this.state
    inputs.houseNumbers.suggestions = [8, 10, 12, 14, 16, 1, 5, 7, 9, 11]
    this.setState({inputs})
  }

  @bind
  getAdditionalsSuggestions() {
    const { inputs } = this.state
    inputs.additionals.suggestions = ['bis', 'ter', 'quater', 'A', 'B', 'C', 'D', 'E']
    this.setState({inputs})
  }

  @bind
  getStreetsSuggestions() {
    const { inputs } = this.state
    inputs.streets.suggestions = ['rue de Javel', 'avenue Émile Zola', 'Quai André Citroën', 'port de Javel Haut']
    this.setState({inputs})
  }

  @bind
  selectInput(input) {
    this.setState({activeInput: input})
  }

  @bind
  handleInput(e) {
    const { activeInput, inputs } = this.state
    activeInput.handle(e)
    if (activeInput === inputs.houseNumbers) this.setState({activeInput: inputs.additionals})
    if (activeInput === inputs.additionals) this.setState({activeInput: inputs.streets})
  }

  render() {
    const { activeInput, inputs, error } = this.state
    const { address, onHouseNumberChange, onAdditionalChange, onStreetChange, onSubmit } = this.props
    const {houseNumber, additional, street} = address

    if (error) return <Error error={error}/>

    return (
      <div>
        <div className="address-form">
          <input className="houseNumber-input" type="text" placeholder="N°" value={houseNumber} onInput={onHouseNumberChange} onClick={() => this.selectInput(inputs.houseNumbers)} />
          <input className="additionals-input" type="text" placeholder=" " value={additional} onInput={onAdditionalChange} onClick={() => this.selectInput(inputs.additionals)} />
          <input className="street-input" type="text" placeholder="Nom de la voie" value={street} onInput={onStreetChange} onClick={() => this.selectInput(inputs.streets)} />
        </div>
        {houseNumber && street ? <div onClick={onSubmit} className="create-button">Créer le {houseNumber} {additional} {street}</div> : null}
        <Suggestions suggestions={activeInput.suggestions} selectSuggestion={this.handleInput} />
      </div>
    )
  }
}
