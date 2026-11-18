/** Values the scroll timeline writes and the WebGL scene reads every frame (eased there). */
export const sceneState = {
  /** 0 = loose particle cloud, 1 = particles gathered into the workflow graph. */
  gather: 0,
  /** Index of the highlighted workflow step, -1 for none. */
  active: -1,
  /** 0..1 after the workflow section: particles drift away and dim. */
  release: 0,
  /** Pointer in normalized device coords (-1..1). */
  pointer: { x: 0, y: 0 },
};
