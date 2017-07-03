const { h, render, Component } = preact
const { bind } = decko

import Welcome from './Welcome'
import Loading from './Loading'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'
import PopUpManager from './PopUpManager'
import Map from './Map'
import badges from './badges.json'
import { addressToString } from './helpers/address'

const stringArray = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','!','?']

function generateToken() {
  let rndString = ''

  for (let i = 0; i <= 15; i++) {
    const rndNum = Math.ceil(Math.random() * stringArray.length) - 1
    rndString = rndString + stringArray[rndNum]
  }

  return rndString
}

function isLocalStorageNameSupported() {
  const testKey = 'test'
  const storage = window.sessionStorage
  try {
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

function useLocalStorage(fn, name, data) {
  if (!isLocalStorageNameSupported()) return
  if (fn === 'getItem') {
    return JSON.parse(localStorage.getItem(name))
  } else if (fn === 'setItem') {
    return localStorage.setItem(name, JSON.stringify(data))
  }
  throw new Error(`localStorage function ${fn} unknown.`)
}

function getBadge(badgeName) {
  return badges.find(badge => badge.name === badgeName)
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tuto: 0,
      newBadge: null,
      showProfile: false,
      showEmailForm: false,
      selectedAddress: null,
      userCoords: null,
      geoOptions: {
        enableHighAccuracy: true,
        maximumAge: 3000,
      },
      fullscreen: true,
      error: null,
    }
    this.loadLocalStorage()
  }

  componentDidMount() {
    this.updatePosition()
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId)
  }

  saveToLocalStorage() {
    if (!isLocalStorageNameSupported()) return
    const { addresses, user } = this.state
    useLocalStorage('setItem', 'addresses', addresses)
    useLocalStorage('setItem', 'user', user)
  }

  loadLocalStorage() {
    const addresses = useLocalStorage('getItem', 'addresses') || []
    const user = useLocalStorage('getItem', 'user') || {token: null, badges: []}
    this.setState({user, addresses})
  }

  @bind
  saveAddresses(addresses) {
    this.setState({addresses}, () => this.saveToLocalStorage(addresses))
  }

  @bind
  openMenu() {
    const { tuto } = this.state
    if (tuto === 1) this.tutoNextStep()
    this.setState({fullscreen: false})
  }

  @bind
  closeMenu() {
    this.setState({fullscreen: true, selectedAddress: null})
  }

  /* ADDRESS */

  @bind
  updateAddress(address) {
    const { user, addresses, selectedAddress } = this.state
    let cpyAddresses = [...addresses]

    if (!address) { // Remove address
      cpyAddresses.pop(selectedAddress)
      this.closeMenu()
    } else if (address && selectedAddress) { // Modify address
      const addressIndex = cpyAddresses.findIndex(addr => addr.id === address.id)
      address.proposals.push({
        user,
        address,
        date: Date.now(),
        type: 'edition',
        comment: `Le ${addressToString(cpyAddresses[addressIndex].address)} a été modifié en ${addressToString(address.address)}`,
      })
      cpyAddresses[addressIndex] = address
    } else if (address && !selectedAddress) { // Create Address
      cpyAddresses = this.addAddress(address)
      this.closeMenu()
    }

    this.saveAddresses(cpyAddresses)
  }

  @bind
  addAddress(address) {
    const { user, addresses, coords, tuto } = this.state
    if (!addresses.length) this.winBadge(getBadge('first address'))
    const cpyAddresses = [...addresses]
    const coordinates = {
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: coords.speed,
    }
    cpyAddresses.push({
      address,
      coords: coordinates,
      id: `${address.houseNumber}_${address.street}_${user.token}`,
      createAt: Date.now(),
      createBy: user,
      proposals: [
        {
          user,
          date: Date.now(),
          type: 'creation',
          comment: '',
        },
      ],
    })
    if (tuto === 2 ) this.tutoNextStep()
    this.closeMenu()
    return cpyAddresses
  }

  @bind
  displayAddress(e) {
    const { addresses } = this.state
    const address = addresses.find(address => address.id === e.target.options.id)
    this.setState({fullscreen: false, selectedAddress: address})
  }

  @bind
  geoError(error) {
    this.setState({error: error.message})
  }

  @bind
  geoSuccess(position) {
    this.setState({coords: position.coords})
  }

  updatePosition() {
    const { geoOptions } = this.state
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(this.geoSuccess, this.geoError, geoOptions)
    } else {
      this.setState({error: 'La géolocalisation n\'est pas prise en charge par votre navigateur.'})
    }
  }

  @bind
  setEmail(email) {
    const { user } = this.state
    user.email = email
    this.setState({user}, useLocalStorage('setItem', 'user', user))
  }

  @bind
  setToken() {
    const { user } = this.state
    user.token = generateToken()
    this.setState({user}, useLocalStorage('setItem', 'user', user))
  }

  @bind
  tutoNextStep() {
    const { tuto } = this.state
    const nextTuto = tuto + 1
    if (nextTuto === 4) {
      const tutorialBadge = getBadge('tutorial')
      this.winBadge(tutorialBadge)
    }
    this.setState({tuto: nextTuto})
  }

  @bind
  winBadge(newBadge) {
    const { badges } = this.state.user
    const newBadges = [...badges]
    if (newBadges.find(badge => badge.id === newBadge.id)) return
    badges.push(newBadge)
    this.setState({badges, newBadge})
    this.saveToLocalStorage()
  }

  @bind
  unlockedBadge(badgeName) {
    const { badges } = this.state.user
    const badge = getBadge(badgeName)
    if (!badges) return false
    return badges.find(unlockedBadge => unlockedBadge.id === badge.id)
  }

  @bind
  resetNewBadge() {
    this.setState({newBadge: null})
  }

  @bind
  displayProfile() {
    this.setState({showProfile: !this.state.showProfile, fullscreen: true})
  }

  @bind
  componentDidUpdate() {
    if (this.map) this.map.forceUpdate()
  }

  render() {
    const { user, tuto, coords, newBadge, showProfile, showEmailForm, addresses, selectedAddress, fullscreen, error } = this.state
    if (!user.token) return <Welcome skip={this.setToken}/>
    if (error) return <Error error={error} />
    if (!coords) return <Loading />

    return (
      <div class="container">
        <PopUpManager userEmail={user.email} showEmailForm={showEmailForm} newBadge={newBadge} tuto={tuto} tutoDone={this.unlockedBadge('tutorial')} setEmail={this.setEmail} tutoNextStep={this.tutoNextStep} resetNewBadge={this.resetNewBadge} />
        <TopNavigation user={user} minimize={!showProfile} close={this.displayProfile} inscription={this.setEmail} />
        <Map ref={ref => this.map = ref} userToken={user.token} addresses={addresses} selectedAddress={selectedAddress} coords={selectedAddress ? selectedAddress.coords : coords} fullscreen={fullscreen} displayAddress={this.displayAddress} closeMenu={this.closeMenu} />
        <BottomNavigation user={user} coords={coords} selectedAddress={selectedAddress} displayDashboard={fullscreen} openForm={this.openMenu} updateAddress={this.updateAddress} />
      </div>
    )
  }
}

// render an instance of App into <body>:
render(<App />, document.body)
