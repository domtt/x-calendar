import * as React from "react";
import DefaultLayout from "../../components/DefaultLayout/DefaultLayout";
import {
  IconButton,
  Typography,
  WithStyles,
  createStyles,
  withStyles
} from "@material-ui/core";
import { inject, observer } from "mobx-react";
import { ApiStore } from "../../services/api/api.store";
import moment, { Moment } from "moment";

import LeftIcon from "@material-ui/icons/KeyboardArrowLeftOutlined";
import RightIcon from "@material-ui/icons/KeyboardArrowRightOutlined";
import {
  totalLength,
  isBetween,
  CalendarEvent
} from "../../services/api/calendar";
import { RouterStore } from "mobx-react-router";
import PieChartView from "../../components/WeeklyChart/PieChartView";

const styles = () => createStyles({});

interface HomePageProps extends WithStyles<typeof styles> {
  api?: ApiStore;
  router?: RouterStore;
}

const DISPLAY_FORMAT = "Do MMM";

@inject("api", "router")
@observer
class HomePage extends React.Component<HomePageProps> {
  state = {
    week: moment().isoWeek()
  };

  previousWeek = () => {
    this.setState({ week: this.state.week - 1 });
  };

  nextWeek = () => {
    this.setState({ week: this.state.week + 1 });
  };

  getStart = (week: number): Moment =>
    moment()
      .set("isoWeek", week)
      .startOf("isoWeek");

  getEnd = (week: number): Moment =>
    moment()
      .set("isoWeek", week)
      .endOf("isoWeek");

  lengthInWeek = (events: CalendarEvent[], week: number): number => {
    const filter = isBetween(this.getStart(week), this.getEnd(week));
    return totalLength(events.filter(filter));
  };

  getTotal = (week: number) => {
    return this.props
      .api!.calendars.map(c => this.lengthInWeek(c.events, week))
      .reduce((a: number, b: number) => a + b, 0);
  };

  handleItemChange = (name: string) => {
    this.props.router!.history.push(`/calendar/${name}`);
  };

  render() {
    const { classes } = this.props;
    const { week } = this.state;
    const { calendars } = this.props.api!;

    const calendarItems = calendars.map(c => ({
      title: c.summary,
      background: c.backgroundColor,
      length: this.lengthInWeek(c.events, week)
    }));

    const weekStartString = this.getStart(week).format(DISPLAY_FORMAT);
    const weekEndString = this.getEnd(week).format(DISPLAY_FORMAT);
    const weekRangeString = `${weekStartString} - ${weekEndString}`;

    return (
      <DefaultLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <IconButton
            disabled={this.getTotal(week - 1) === 0}
            onClick={this.previousWeek}
          >
            <LeftIcon />
          </IconButton>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <Typography variant="h3">Weekly</Typography>
            <Typography variant="subtitle1">{weekRangeString}</Typography>
          </div>
          <IconButton
            disabled={moment().isoWeek() === week}
            onClick={this.nextWeek}
          >
            <RightIcon />
          </IconButton>
        </div>
        <PieChartView
          items={calendarItems}
          onItemChange={this.handleItemChange}
        />
      </DefaultLayout>
    );
  }
}

export default withStyles(styles)(HomePage);
