import {
  buildDiagramEdgeKey,
  filterFlattenedDiagramRowsByLangkahIds,
  flattenDiagramPathOverridesToRows,
  hasInvalidDiagramEdgeKeys,
  parseDiagramEdgeKey,
} from './diagram-edge-key.util';

describe('diagram-edge-key.util', () => {
  it('should_detect_invalid_edge_key', () => {
    expect(
      hasInvalidDiagramEdgeKeys({
        edges: {
          'invalid-key': {
            sSide: 'bottom',
            eSide: 'top',
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 10, y: 10 },
            bendPoints: [],
          },
        },
      }),
    ).toBe(true);
  });

  it('should_flatten_path_overrides_to_relational_rows', () => {
    const edgeKey = buildDiagramEdgeKey('from-1', 'to-1', 'UTAMA');
    const actual = flattenDiagramPathOverridesToRows({
      detailSopId: 'detail-1',
      jenis: 'FLOWCHART',
      pathOverrides: {
        edges: {
          [edgeKey]: {
            sSide: 'bottom',
            eSide: 'top',
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 10, y: 10 },
            bendPoints: [{ x: 5, y: 5 }],
          },
        },
        labels: {
          [edgeKey]: { x: 3, y: 4 },
        },
      },
    });

    expect(actual.edges).toHaveLength(1);
    expect(actual.edges[0]?.dariLangkahSopId).toBe('from-1');
    expect(actual.edges[0]?.keLangkahSopId).toBe('to-1');
    expect(actual.bendPoints).toHaveLength(1);
    expect(actual.bendPoints[0]?.urutan).toBe(0);
    expect(actual.labels).toHaveLength(1);
  });

  it('should_parse_valid_edge_key', () => {
    const key = buildDiagramEdgeKey('from-1', 'to-1', 'UTAMA');
    expect(parseDiagramEdgeKey(key)?.dariLangkahId).toBe('from-1');
    expect(parseDiagramEdgeKey(key)?.keLangkahId).toBe('to-1');
  });

  it('should_drop_edges_with_unknown_langkah_ids', () => {
    const validKey = buildDiagramEdgeKey('langkah-a', 'langkah-b', 'UTAMA');
    const invalidKey = buildDiagramEdgeKey('start-terminator', 'langkah-b', 'UTAMA');
    const flattened = flattenDiagramPathOverridesToRows({
      detailSopId: 'detail-1',
      jenis: 'BPMN',
      pathOverrides: {
        edges: {
          [validKey]: {
            sSide: 'bottom',
            eSide: 'top',
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 10, y: 10 },
            bendPoints: [],
          },
          [invalidKey]: {
            sSide: 'bottom',
            eSide: 'top',
            startPoint: { x: 1, y: 1 },
            endPoint: { x: 2, y: 2 },
            bendPoints: [],
          },
        },
        labels: {
          [validKey]: { x: 3, y: 4 },
          [invalidKey]: { x: 5, y: 6 },
        },
      },
    });
    const actual = filterFlattenedDiagramRowsByLangkahIds(flattened, new Set(['langkah-a', 'langkah-b']));
    expect(actual.edges).toHaveLength(1);
    expect(actual.edges[0]?.dariLangkahSopId).toBe('langkah-a');
    expect(actual.labels).toHaveLength(1);
    expect(actual.labels[0]?.kunciLabel).toBe(validKey);
  });
});
