import React, { useState } from "react";
import { useEffect } from "react";
import { getAllRecieptsMonths } from "../../utils/dbRequests";

import DeleteRecieptMonth from "./DeleteRecieptMonth";
import GenerateReciepts from "./GenerateReciepts";
import SendRecieptsEmail from "./SendRecieptsEmail";
import SendReminderEmail from "./SendReminderEmail";

export default function Reciepts({
  apartments,
  users,
  refresh,
  services,
  storage,
}) {
  const [recieptsMonths, setRecieptsMonths] = useState([]);

  const refreshMonths = () => {
    getAllRecieptsMonths().then(setRecieptsMonths);
  };

  const refreshAll = () => {
    refresh();
    getAllRecieptsMonths().then(setRecieptsMonths);
  };

  useEffect(() => {
    refreshMonths();
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "25px" }}>
      <GenerateReciepts
        users={users}
        services={services}
        storage={storage}
        apartments={apartments}
        refresh={refreshAll}
      />
      <DeleteRecieptMonth
        refreshMonths={refreshMonths}
        recieptsMonths={recieptsMonths}
        refreshAll={refresh}
      />
      <SendRecieptsEmail
        users={users}
        recieptsMonths={recieptsMonths}
        apartments={apartments}
      />
      <SendReminderEmail
        users={users}
        recieptsMonths={recieptsMonths}
        apartments={apartments}
      />
    </div>
  );
}
