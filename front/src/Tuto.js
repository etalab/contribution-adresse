class Tuto extends Component {
  constructor(props) {
    super(props)
    this.step = [
      <div class="overlay resizable center">
        <div class="panel">
          <p>Placez vous à l'adresse que vous souhaitez ajouter</p>
          <button onClick={props.nextStep}>Ok</button>
        </div>
      </div>,
      <div class="overlay bottom">
        <div class="arrow-box">Appuyez sur le bouton pour ajouter une nouvelle adresse</div>
      </div>,
      <div class="overlay resizable top">
        <div class="panel">Saisissez le numéro ainsi que le nom de la voie de l'adresse</div>
      </div>,
      <div class="overlay resizable center">
        <div class="panel">
          <p>Félicitations vous venez de créer votre première adresse !</p>
          <p>Grâce à votre contribution, la base adresse national s'est enrichie</p>
          <div class="buttons">
            <button onClick={props.nextStep}>Fermer</button>
            <button onClick={props.saveProgression}>Sauvegarder ma progression</button>
          </div>
        </div>
      </div>,
    ]
  }

  render() {
    const { stepIndex } = this.props

    return this.step[stepIndex] || null
  }
}
