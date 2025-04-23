import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ExportImport from './ExportImport';
import { importPolygons } from '../lib/features/polygonSlice';

const mockStore = configureStore([]);

describe('ExportImport', () => {
  let store: any;
  const validGeoJSON = {
    type: 'FeatureCollection',
    features: [],
  };
  const invalidGeoJSON = {
    foo: 'bar'
  };
  const validJSONnotFeatureCollection = {
    type: "Polygon",
    coordinates: [[]]
  }

  beforeEach(() => {
    store = mockStore({ polygon: { polygons: [] } });
    store.dispatch = jest.fn();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render an import button', () => {
    render(
      <Provider store={store}>
        <ExportImport />
      </Provider>
    );
    expect(screen.getByText('Import Polygons')).toBeInTheDocument();
  });

  it('should open file select dialog when import button is clicked', () => {
    render(
      <Provider store={store}>
        <ExportImport />
      </Provider>
    );
    const inputElement = screen.getByRole('textbox')
    expect(inputElement).not.toBeVisible();
    fireEvent.click(screen.getByText('Import Polygons'));
  });

  it('should dispatch importPolygons action when a valid GeoJSON file is imported', async () => {
    const file = new File([JSON.stringify(validGeoJSON)], 'valid.json', { type: 'application/json' });
    render(
      <Provider store={store}>
        <ExportImport />
      </Provider>
    );
    const input = screen.getByLabelText('Import Polygons');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(importPolygons(validGeoJSON));
    });
  });

  it('should show an alert when an invalid JSON file is imported', async () => {
    const file = new File(['invalid json'], 'invalid.json', { type: 'application/json' });
    render(
      <Provider store={store}>
        <ExportImport />
      </Provider>
    );
    const input = screen.getByLabelText('Import Polygons');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Error importing file. Please make sure it\'s a valid GeoJSON file.'
      );
    });
  });

  it('should show an alert when a valid JSON file that is not a FeatureCollection is imported', async () => {
    const file = new File([JSON.stringify(validJSONnotFeatureCollection)], 'valid.json', { type: 'application/json' });
    render(
      <Provider store={store}>
        <ExportImport />
      </Provider>
    );
    const input = screen.getByLabelText('Import Polygons');
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Error importing file. Please make sure it\'s a valid GeoJSON file.'
      );
    });
  });
});