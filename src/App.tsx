import React, { useCallback, useRef, useReducer } from "react";
import "./App.css";
import classNames from "classnames";

interface GridItem {
  readonly entry: boolean;
  readonly exit: boolean;
  readonly blocked: boolean;
  enabled: boolean;
  flowing: boolean;
  changing: boolean;
}

const gridSize = 10;
const numItems = gridSize * gridSize;
const initialGridItems: () => GridItem[] = () =>
  new Array(numItems).fill(1).map((_, i) => ({
    entry: i === 0,
    exit: i === numItems - 1,
    blocked: Math.random() < 0.2,
    // blocked: false,
    enabled: i === 0,
    flowing: i === 0,
    changing: false,
  }));

function App() {
  const gridItems = useRef<GridItem[]>(initialGridItems());

  const [, forceRender] = useReducer((s) => s + 1, 0);

  const neighborsFlowing = useCallback((i: number) => {
    if (!gridItems.current[i].enabled) return false;
    const left = i - 1 >= 0 && gridItems.current[i - 1].flowing;
    const right = i + 1 < gridSize && gridItems.current[i + 1].flowing;
    const above = i >= gridSize && gridItems.current[i - gridSize].flowing;
    return left || right || above;
  }, []);

  const checkAllItems = useCallback((): void => {
    const flowingGridItems = gridItems.current.map((item, i) => {
      if (!item.flowing && neighborsFlowing(i)) enableFlowing(i);

      return {
        ...item,
        flowing: item.flowing || neighborsFlowing(i),
      };
    }, []);

    const prevFlowing = gridItems.current.reduce(
      (acc, item) => (item.flowing ? acc + 1 : acc),
      0
    );
    const nowFlowing = flowingGridItems.reduce(
      (acc, item) => (item.flowing ? acc + 1 : acc),
      0
    );

    // gridItems.current = flowingGridItems;
    // if (prevFlowing !== nowFlowing) return checkAllItems();
  }, [neighborsFlowing]);

  const enableFlowing = useCallback((index) => {
    gridItems.current[index].changing = true;
    forceRender();

    setTimeout(() => {
      gridItems.current[index].flowing = true;
      gridItems.current[index].changing = false;
      forceRender();
      checkAllItems();
    }, 3000);
  }, []);

  const disableGridItem = useCallback(
    (index) => {
      gridItems.current[index].changing = false;

      setTimeout(() => {
        gridItems.current[index].enabled = false;
        gridItems.current[index].flowing = false;
        gridItems.current[index].changing = false;

        forceRender();
      }, 3000);
    },
    [gridItems]
  );

  const handleGridItemClick = useCallback(
    (index: number) => {
      gridItems.current[index].enabled = !gridItems.current[index].enabled;
      checkAllItems();

      forceRender();

      setTimeout(() => disableGridItem(index), 10000);
    },
    [checkAllItems]
  );

  return (
    <div className="grid">
      {gridItems.current.map(
        ({ entry, exit, blocked, enabled, flowing, changing }, i) => {
          return (
            <div
              onClick={() => handleGridItemClick(i)}
              className={classNames(
                "grid-item",
                changing && "changing",
                entry && "entry",
                exit && "exit",
                blocked && "blocked",
                enabled && "enabled",
                flowing && "flowing"
              )}
            ></div>
          );
        }
      )}
    </div>
  );
}

export default App;
