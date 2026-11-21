import { act, fireEvent, render, screen } from '@testing-library/react'
import { UpdateBanner } from './UpdateBanner'

describe('UpdateBanner', () => {
  it('no se ve mientras no haya versión nueva', () => {
    render(<UpdateBanner register={() => {}} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar' })).not.toBeInTheDocument()
  })

  it('avisa de que hay una versión nueva y ofrece el botón «Actualizar»', () => {
    let hayVersionNueva: (aplicar: () => void) => void = () => {}
    render(<UpdateBanner register={(cb) => { hayVersionNueva = cb }} />)
    act(() => hayVersionNueva(() => {}))
    expect(screen.getByRole('status')).toHaveTextContent('Hay una nueva versión')
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeEnabled()
  })

  it('al pulsar «Actualizar» aplica la versión nueva y no deja pulsar dos veces', () => {
    const aplicar = vi.fn()
    let hayVersionNueva: (aplicar: () => void) => void = () => {}
    render(<UpdateBanner register={(cb) => { hayVersionNueva = cb }} />)
    act(() => hayVersionNueva(aplicar))
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(aplicar).toHaveBeenCalledTimes(1)
    const boton = screen.getByRole('button', { name: 'Actualizando…' })
    expect(boton).toBeDisabled()
  })
})
