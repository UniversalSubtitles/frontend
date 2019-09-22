import React from 'react'
import { Column, Index, Table } from 'react-virtualized'
import { connect } from 'react-redux'

import { IPlanet } from './Planets'
import * as A from './actions'
import { IAppState } from './reducer'
import { ISort } from './types'
import { sort } from './sorting'
import SatellitesHeader from './SatellitesHeader'

export interface ISatellite {
  id: number
  planetId: number
}

interface IState extends ISort {}

interface IProps {
  satellites: ReadonlyArray<ISatellite>
  selectedPlanet?: IPlanet

  dispatchLoadSatellites: typeof A.loadSatellites
  dispatchSetSatellites: typeof A.setSatellites
}

class Satellites extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {} as IState
  }

  componentDidMount() {
    this.props.dispatchLoadSatellites()
  }

  // Maps column name to its unit.
  units: { [unitId: string]: JSX.Element } = {
    'GM': <span>km<sup>3</sup>/sec<sup>2</sup></span>,
    'Mean Radius': <span>km</span>,
    'Mean Density': <span>g/cm<sup>3</sup></span>,
    'Magnitude': <span>V<sub>0</sub> or R</span>,
  }

  private rowClassName = ({ index }: Index): string => {
    return index % 2 === 0 ? 'oddRow' : ''
  }

  private columnHeader = (column: string): React.ReactNode => {
    return <span>{column}<br/><span className='unit'>({this.units[column]})</span></span>
  }

  render(): React.ReactNode {
    const { selectedPlanet } = this.props
    const satellites = selectedPlanet
      ? this.props.satellites.filter(s => s.planetId === selectedPlanet.id)
      : this.props.satellites
    const { sortDirection, sortBy } = this.state

    return (
      <div>
        <SatellitesHeader numberOfSatellites={satellites.length} />

        <Table
          width={575}
          height={514}
          headerHeight={90}
          rowHeight={40}
          rowCount={satellites.length}
          rowGetter={({ index }: Index) => satellites[index]}
          rowClassName={this.rowClassName}
          sort={this.sort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        >
          <Column label='Name' dataKey='name' width={105} className='main-column' />
          <Column label={this.columnHeader('GM')} dataKey='gm' width={95} />
          <Column label={this.columnHeader('Mean Radius')} dataKey='radius' width={75} />
          <Column label={this.columnHeader('Mean Density')} dataKey='density' width={75} />
          <Column label={this.columnHeader('Magnitude')} dataKey='magnitude' width={105} />
          <Column label='Geometric Albedo' dataKey='albedo' width={100} />
        </Table>
      </div>
    )
  }

  private sort = ({ sortBy, sortDirection }: ISort) => {
    this.setState({ sortBy, sortDirection })
    this.props.dispatchSetSatellites(sort(this.props.satellites, sortBy, sortDirection))
  }
}

const mapStateToProps = (state: IAppState) => ({
  selectedPlanet: state.selectedPlanet,
  satellites: state.satellites
})

const mapDispatchToProps = {
  dispatchLoadSatellites: A.loadSatellites,
  dispatchSetSatellites: A.setSatellites,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Satellites)
