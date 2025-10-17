import {Switch as _Switch} from '@headlessui/react'
import React from "react";

export function Switch({checked = false, onChange}: {
    checked?: boolean,
    onChange?: (value: boolean) => void
}) {
    return (
        <_Switch
            checked={checked}
            onChange={onChange}
            className="group relative flex items-center w-6 h-4 border-2 p-0.5 cursor-pointer rounded-full ease-in-out
            focus:not-data-focus:outline-none  data-focus:outline-white data-checked:border-green-600 data-disabled:cursor-not-allowed"
        >
      <span
          aria-hidden="true"
          className="pointer-events-none size-2 border-2 translate-x-0 rounded-full transition duration-200 ease-in-out group-data-checked:translate-x-2 group-data-checked:border-green-600"
      />
        </_Switch>
    )
}