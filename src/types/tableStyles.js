// src/types/tableStyles.js
// Microsoft Word Built-in Table Styles (Exact Replicas)

export const TABLE_STYLES = {
  tableGrid: {
    id: 'tableGrid',
    name: 'Table Grid',
    description: 'Word varsayılan tablo',
    preview: '⊞',
    headerRow: false,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        border: 'solid #000000 0.5pt',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#ffffff',
        color: '#000000',
        fontWeight: 'normal',
        border: 'solid #000000 0.5pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'solid #000000 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: false,
    },
  },

  gridTable1Light: {
    id: 'gridTable1Light',
    name: 'Grid Table 1 Light',
    description: 'Açık grid tablo',
    preview: '▦',
    headerRow: true,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        border: 'solid #D0CECE 0.5pt',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#ffffff',
        color: '#000000',
        fontWeight: 'bold',
        border: 'solid #D0CECE 0.5pt',
        borderBottom: 'solid #000000 1pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'solid #D0CECE 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: false,
    },
  },

  gridTable4Accent1: {
    id: 'gridTable4Accent1',
    name: 'Grid Table 4 - Accent 1',
    description: 'Mavi başlıklı tablo',
    preview: '▦',
    headerRow: true,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        border: 'solid #5B9BD5 0.5pt',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#5B9BD5',
        color: '#ffffff',
        fontWeight: 'bold',
        border: 'solid #5B9BD5 0.5pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'solid #5B9BD5 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      cellAlt: {
        backgroundColor: '#DEEAF6',
        color: '#000000',
        border: 'solid #5B9BD5 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: true,
    },
  },

  listTable2Accent1: {
    id: 'listTable2Accent1',
    name: 'List Table 2 - Accent 1',
    description: 'Liste tablo mavi',
    preview: '▤',
    headerRow: true,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#5B9BD5',
        color: '#ffffff',
        fontWeight: 'bold',
        borderBottom: 'solid #5B9BD5 1pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        borderBottom: 'solid #5B9BD5 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      cellAlt: {
        backgroundColor: '#DEEAF6',
        color: '#000000',
        border: 'none',
        borderBottom: 'solid #5B9BD5 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: true,
    },
  },

  colorfulGrid: {
    id: 'colorfulGrid',
    name: 'Colorful Grid',
    description: 'Renkli grid',
    preview: '🎨',
    headerRow: true,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        border: 'solid #ffffff 2.25pt',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#5B9BD5',
        color: '#ffffff',
        fontWeight: 'bold',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#DEEAF6',
        color: '#000000',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      cellAlt: {
        backgroundColor: '#5B9BD5',
        color: '#ffffff',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: true,
    },
  },

  colorfulGridAccent5: {
    id: 'colorfulGridAccent5',
    name: 'Colorful Grid - Accent 5',
    description: 'Turuncu renkli',
    preview: '🟧',
    headerRow: true,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        border: 'solid #ffffff 2.25pt',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#FFC000',
        color: '#ffffff',
        fontWeight: 'bold',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#FFF2CC',
        color: '#000000',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      cellAlt: {
        backgroundColor: '#FFC000',
        color: '#ffffff',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: true,
    },
  },

  gridTable5DarkAccent1: {
    id: 'gridTable5DarkAccent1',
    name: 'Grid Table 5 Dark - Accent 1',
    description: 'Koyu mavi tablo',
    preview: '▦',
    headerRow: true,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        border: 'solid #2E75B5 0.5pt',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#2E75B5',
        color: '#ffffff',
        fontWeight: 'bold',
        border: 'solid #2E75B5 0.5pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#DEEAF6',
        color: '#000000',
        border: 'solid #2E75B5 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      cellAlt: {
        backgroundColor: '#5B9BD5',
        color: '#ffffff',
        border: 'solid #2E75B5 0.5pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: true,
    },
  },

  colorfulGridAccent6: {
    id: 'colorfulGridAccent6',
    name: 'Colorful Grid - Accent 6',
    description: 'Yeşil renkli',
    preview: '🟩',
    headerRow: true,
    styles: {
      table: {
        borderCollapse: 'collapse',
        width: '100%',
        border: 'solid #ffffff 2.25pt',
        fontFamily: 'Calibri, sans-serif',
        fontSize: '11pt',
      },
      header: {
        backgroundColor: '#70AD47',
        color: '#ffffff',
        fontWeight: 'bold',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        textAlign: 'left',
        verticalAlign: 'top',
      },
      cell: {
        backgroundColor: '#E2EFDA',
        color: '#000000',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      cellAlt: {
        backgroundColor: '#70AD47',
        color: '#ffffff',
        border: 'solid #ffffff 2.25pt',
        padding: '0cm 5.4pt',
        verticalAlign: 'top',
      },
      alternateRow: true,
    },
  },
};

// Helper function to apply table style to table data structure
export function applyTableStyle(styleId, rows, cols) {
  const style = TABLE_STYLES[styleId] || TABLE_STYLES.tableGrid;
  
  // Generate cellStyles object for each cell
  const cellStyles = {};
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellKey = `${row}-${col}`;
      
      if (row === 0 && style.headerRow) {
        // Header row
        cellStyles[cellKey] = {
          backgroundColor: style.styles.header.backgroundColor,
          color: style.styles.header.color,
          fontWeight: style.styles.header.fontWeight,
          borderBottom: style.styles.header.borderBottom,
          border: style.styles.header.border,
        };
      } else {
        // Regular cells
        const isAlternate = style.styles.alternateRow && row % 2 === 0;
        const cellStyle = isAlternate ? style.styles.cellAlt : style.styles.cell;
        
        cellStyles[cellKey] = {
          backgroundColor: cellStyle.backgroundColor,
          color: cellStyle.color,
          border: cellStyle.border,
          borderBottom: cellStyle.borderBottom,
        };
      }
    }
  }
  
  return {
    cellStyles,
    headerRow: style.headerRow,
    tableStyle: style.styles.table,
  };
}
