import { describe, expect, it } from 'vitest'
import { assignStepColumns } from '../bpmn-graph-layer.util'

const IMP = ['lane-a', 'lane-b']

function step(
  id: string,
  seq: number,
  type: string,
  laneId: string,
): {
  id_step: string
  seq_number: number
  type: string
  id_implementer: string
} {
  return { id_step: id, seq_number: seq, type, id_implementer: laneId }
}

describe('assignStepColumns', () => {
  it('should_place_successor_one_column_right_when_same_lane', () => {
    const steps = [
      step('s1', 1, 'task', 'lane-a'),
      step('s2', 2, 'task', 'lane-a'),
    ]
    const connections = [{ from: 'bpmn-step-1', to: 'bpmn-step-2' }]
    const cols = assignStepColumns(steps, connections, IMP)
    expect(cols.get('s1')).toBe(0)
    expect(cols.get('s2')).toBe(1)
  })

  it('should_keep_cross_lane_successor_one_column_right', () => {
    const steps = [
      step('s1', 1, 'task', 'lane-a'),
      step('s2', 2, 'task', 'lane-b'),
    ]
    const connections = [{ from: 'bpmn-step-1', to: 'bpmn-step-2' }]
    const cols = assignStepColumns(steps, connections, IMP)
    expect(cols.get('s1')).toBe(0)
    expect(cols.get('s2')).toBe(1)
  })

  it('should_not_reset_columns_when_lanes_alternate', () => {
    const steps = [
      step('s1', 1, 'task', 'lane-a'),
      step('s2', 2, 'task', 'lane-b'),
      step('s3', 3, 'task', 'lane-a'),
      step('s4', 4, 'task', 'lane-b'),
    ]
    const connections = [
      { from: 'bpmn-step-1', to: 'bpmn-step-2' },
      { from: 'bpmn-step-2', to: 'bpmn-step-3' },
      { from: 'bpmn-step-3', to: 'bpmn-step-4' },
    ]
    const cols = assignStepColumns(steps, connections, IMP)
    expect([...steps.map((s) => cols.get(s.id_step))]).toEqual([0, 1, 2, 3])
  })

  it('should_separate_ya_tidak_branches_from_decision', () => {
    const steps = [
      step('d1', 1, 'decision', 'lane-a'),
      step('y1', 2, 'task', 'lane-a'),
      step('n1', 3, 'task', 'lane-a'),
    ]
    const connections = [
      { from: 'bpmn-step-1', to: 'bpmn-step-2' },
      { from: 'bpmn-step-1', to: 'bpmn-step-3' },
    ]
    const cols = assignStepColumns(steps, connections, IMP)
    expect(cols.get('d1')).toBe(0)
    expect(cols.get('y1')).not.toBe(cols.get('n1'))
    expect(cols.get('y1')).toBeGreaterThanOrEqual(1)
    expect(cols.get('n1')).toBeGreaterThanOrEqual(1)
  })

  it('should_handle_loopback_tidak_after_forward_ya', () => {
    const steps = [
      step('d1', 1, 'decision', 'lane-a'),
      step('t2', 2, 'task', 'lane-a'),
      step('t3', 3, 'task', 'lane-a'),
    ]
    const connections = [
      { from: 'bpmn-step-1', to: 'bpmn-step-2' },
      { from: 'bpmn-step-2', to: 'bpmn-step-3' },
      { from: 'bpmn-step-3', to: 'bpmn-step-1' },
    ]
    const cols = assignStepColumns(steps, connections, IMP)
    expect(cols.get('d1')).toBe(0)
    expect(cols.get('t2')).toBeGreaterThan(cols.get('d1')!)
    expect(cols.get('t3')).toBeGreaterThanOrEqual(cols.get('t2')!)
  })
})
