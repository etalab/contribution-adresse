const { h, Component } = preact

import LeafletMap from './LeafletMap'
import Locator from './Locator'

export default class Map extends Component {

  componentDidUpdate() {
    if (this.leafletMap) this.leafletMap.forceUpdate()
  }

  render() {
    const { user, addresses, selectedAddress, coords, fullscreen, displayAddress, closeMenu } = this.props

    return (
      <div>
        <LeafletMap ref={ref => this.leafletMap = ref} user={user} addresses={addresses} selectedAddress={selectedAddress} displayAddress={displayAddress} onCloseMenu={closeMenu} coords={coords} fullscreen={fullscreen} />
        <Locator accuracy={coords.accuracy} fullscreen={fullscreen} display={!selectedAddress} />
      </div>
    )
  }
}
