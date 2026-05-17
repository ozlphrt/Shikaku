export const CAMPAIGN_PACKS = [
  {
    id: 'easy',
    name: 'Beginner (5×5 - 6×6)',
    difficulty: 'Easy',
    description: 'Perfect for beginners to learn the basics of grid partition.',
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    levels: [
      {
        id: 'easy_1',
        name: 'First Slices',
        gridSize: { rows: 5, cols: 5 },
        numbers: [
          { x: 0, y: 0, value: 4 }, // 2x2 at top-left
          { x: 1, y: 3, value: 6 }, // 2x3 at top-right
          { x: 3, y: 0, value: 6 }, // 3x2 at bottom-left
          { x: 4, y: 4, value: 9 }  // 3x3 at bottom-right
        ]
      },
      {
        id: 'easy_2',
        name: 'Tetris Block',
        gridSize: { rows: 5, cols: 5 },
        numbers: [
          { x: 0, y: 2, value: 5 }, // 1x5 at top row
          { x: 1, y: 0, value: 4 }, // 2x2 at mid-left
          { x: 2, y: 3, value: 4 }, // 2x2 at mid-right
          { x: 3, y: 4, value: 4 }, // 4x1 at far-right
          { x: 4, y: 1, value: 8 }  // 2x4 at bottom
        ]
      },
      {
        id: 'easy_3',
        name: 'Grid Lock',
        gridSize: { rows: 6, cols: 6 },
        numbers: [
          { x: 0, y: 1, value: 6 },  // 1x6 at top
          { x: 2, y: 0, value: 6 },  // 3x2 at left
          { x: 1, y: 3, value: 4 },  // 2x2 at center-top
          { x: 3, y: 2, value: 8 },  // 4x2 at center-bottom
          { x: 2, y: 5, value: 6 },  // 3x2 at right
          { x: 5, y: 4, value: 6 }   // 1x6 at bottom
        ]
      },
      {
        id: 'easy_4',
        name: 'Balanced Pillars',
        gridSize: { rows: 6, cols: 6 },
        numbers: [
          { x: 0, y: 0, value: 9 },  // 3x3 top-left
          { x: 0, y: 5, value: 9 },  // 3x3 top-right
          { x: 5, y: 0, value: 9 },  // 3x3 bottom-left
          { x: 5, y: 5, value: 9 }   // 3x3 bottom-right
        ]
      }
    ]
  },
  {
    id: 'medium',
    name: 'Intermediate (8×8 - 9×9)',
    difficulty: 'Medium',
    description: 'Bigger grids require narrow corridors and clever deductions.',
    color: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    levels: [
      {
        id: 'medium_1',
        name: 'The Hanger',
        gridSize: { rows: 8, cols: 8 },
        numbers: [
          { x: 0, y: 0, value: 16 }, // 4x4 top-left
          { x: 0, y: 7, value: 16 }, // 4x4 top-right
          { x: 7, y: 0, value: 16 }, // 4x4 bottom-left
          { x: 7, y: 7, value: 16 }  // 4x4 bottom-right
        ]
      },
      {
        id: 'medium_2',
        name: 'Symmetric Split',
        gridSize: { rows: 8, cols: 8 },
        numbers: [
          { x: 0, y: 3, value: 8 },  // 1x8 top row
          { x: 7, y: 4, value: 8 },  // 1x8 bottom row
          { x: 3, y: 0, value: 8 },  // 8x1 left col
          { x: 4, y: 7, value: 8 },  // 8x1 right col
          { x: 2, y: 2, value: 9 },  // 3x3 mid-left
          { x: 5, y: 5, value: 9 },  // 3x3 mid-right
          { x: 1, y: 5, value: 6 },  // 2x3 mid-top-right
          { x: 6, y: 2, value: 6 }   // 2x3 mid-bottom-left
        ]
      },
      {
        id: 'medium_3',
        name: 'Staircase',
        gridSize: { rows: 9, cols: 9 },
        numbers: [
          { x: 0, y: 0, value: 12 }, // 3x4
          { x: 0, y: 5, value: 15 }, // 3x5
          { x: 3, y: 0, value: 9 },  // 3x3
          { x: 3, y: 6, value: 9 },  // 3x3
          { x: 5, y: 3, value: 12 }, // 4x3
          { x: 8, y: 0, value: 12 }, // 3x4
          { x: 8, y: 8, value: 12 }  // 3x4
        ]
      },
      {
        id: 'medium_4',
        name: 'Center Piece',
        gridSize: { rows: 9, cols: 9 },
        numbers: [
          { x: 4, y: 4, value: 25 }, // 5x5 center
          { x: 0, y: 0, value: 8 },  // 2x4 top-left
          { x: 0, y: 8, value: 8 },  // 4x2 top-right
          { x: 8, y: 0, value: 8 },  // 4x2 bottom-left
          { x: 8, y: 8, value: 8 },  // 2x4 bottom-right
          { x: 0, y: 4, value: 6 },  // 2x3 top-mid
          { x: 4, y: 0, value: 6 },  // 3x2 mid-left
          { x: 4, y: 8, value: 6 },  // 3x2 mid-right
          { x: 8, y: 4, value: 6 }   // 2x3 bottom-mid
        ]
      }
    ]
  },
  {
    id: 'hard',
    name: 'Expert (10×10 - 12×12)',
    difficulty: 'Hard',
    description: 'Expert-level 10x10 and 12x12 spaces. Pure mathematical logic.',
    color: 'from-rose-500/20 to-orange-500/20',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    levels: [
      {
        id: 'hard_1',
        name: 'Double Zero',
        gridSize: { rows: 10, cols: 10 },
        numbers: [
          { x: 0, y: 0, value: 20 }, // 4x5
          { x: 0, y: 9, value: 20 }, // 5x4
          { x: 9, y: 0, value: 20 }, // 5x4
          { x: 9, y: 9, value: 20 }, // 4x5
          { x: 4, y: 4, value: 4 },  // 2x2
          { x: 4, y: 5, value: 4 },  // 2x2
          { x: 5, y: 4, value: 4 },  // 2x2
          { x: 5, y: 5, value: 8 }   // 4x2
        ]
      },
      {
        id: 'hard_2',
        name: 'The Colosseum',
        gridSize: { rows: 10, cols: 10 },
        numbers: [
          { x: 0, y: 0, value: 10 },
          { x: 0, y: 5, value: 15 },
          { x: 2, y: 2, value: 16 },
          { x: 2, y: 7, value: 12 },
          { x: 5, y: 0, value: 12 },
          { x: 5, y: 5, value: 9 },
          { x: 7, y: 2, value: 6 },
          { x: 7, y: 7, value: 10 },
          { x: 9, y: 0, value: 5 },
          { x: 9, y: 9, value: 5 }
        ]
      },
      {
        id: 'hard_3',
        name: 'Symmetric Palace',
        gridSize: { rows: 12, cols: 12 },
        numbers: [
          { x: 0, y: 0, value: 36 }, // 6x6 top-left
          { x: 0, y: 11, value: 36 }, // 6x6 top-right
          { x: 11, y: 0, value: 36 }, // 6x6 bottom-left
          { x: 11, y: 11, value: 36 } // 6x6 bottom-right
        ]
      },
      {
        id: 'hard_4',
        name: 'Ultimate Labyrinth',
        gridSize: { rows: 12, cols: 12 },
        numbers: [
          { x: 0, y: 0, value: 24 }, // 4x6
          { x: 0, y: 6, value: 24 }, // 6x4
          { x: 4, y: 0, value: 12 }, // 3x4
          { x: 4, y: 8, value: 16 }, // 4x4
          { x: 7, y: 4, value: 20 }, // 5x4
          { x: 11, y: 0, value: 12 }, // 4x3
          { x: 11, y: 6, value: 16 }, // 4x4
          { x: 11, y: 11, value: 20 } // 5x4
        ]
      }
    ]
  }
];
