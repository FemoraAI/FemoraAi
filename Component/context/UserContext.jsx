"use client"

import { createContext, useState, useContext, useCallback } from "react"
import moment from "moment"
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from '../../firebase.config'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    uid: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: null,
    lastPeriodStart: null,
    periodDays: null,
    cycleDays: null,
    isLoggedIn: false,
    isDoctor: false,
    needsOnboarding: true,
    createdAt: null,
    lastUpdated: null,
    onboardingCompleted: false,
  })

  const checkDoctorStatus = useCallback(async (formattedPhone) => {
    const doctorsRef = collection(db, "doctors")
    const doctorQuery = query(doctorsRef, where("phone", "==", formattedPhone))
    const doctorQuerySnapshot = await getDocs(doctorQuery)
    return !doctorQuerySnapshot.empty
  }, [])

  const login = async () => {
    const auth = getAuth()
    const currentUser = auth.currentUser

    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid))
        const formattedPhone = currentUser.phoneNumber
        const isDoctor = await checkDoctorStatus(formattedPhone)

        if (userDoc.exists()) {
          setUserData((prev) => ({
            ...prev,
            ...userDoc.data(),
            isLoggedIn: true,
            isDoctor,
            needsOnboarding: false,
          }))
        } else {
          setUserData((prev) => ({
            ...prev,
            uid: currentUser.uid,
            phone: formattedPhone,
            isLoggedIn: true,
            isDoctor,
            needsOnboarding: true,
          }))
        }
      } catch (error) {
        console.error("Error in login:", error)
      }
    }
  }

  const logout = () => {
    setUserData((prev) => ({
      ...prev,
      isLoggedIn: false,
      isDoctor: false,
      uid: null,
      needsOnboarding: true,
    }))
  }

  const updateUserData = async (newData) => {
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error("No authenticated user found")
      }

      const timestamp = new Date().toISOString()
      const userRef = doc(db, "users", currentUser.uid)

      const firestoreData = {
        ...(newData.name && { name: newData.name }),
        ...(newData.phone && { phone: newData.phone }),
        ...(newData.address && { address: newData.address }),
        ...(newData.profileImage && { profileImage: newData.profileImage }),
        ...(newData.lastPeriodStart && { lastPeriodStart: newData.lastPeriodStart }),
        ...(newData.periodDays && { periodDays: newData.periodDays }),
        ...(newData.cycleDays && { cycleDays: newData.cycleDays }),
        ...(newData.onboardingCompleted && { onboardingCompleted: newData.onboardingCompleted }),
        ...(newData.isDoctor && { isDoctor: newData.isDoctor }),
        lastUpdated: timestamp,
      }

      await setDoc(userRef, firestoreData, { merge: true })

      setUserData((prev) => ({
        ...prev,
        ...firestoreData,
        isLoggedIn: true,
        needsOnboarding: false,
      }))
    } catch (error) {
      console.error("Error updating user data:", error)
      throw error
    }
  }

  const getNextPeriodDate = () => {
    const lastPeriod = moment(userData.lastPeriodStart)
    const cycleLength = Number.parseInt(userData.cycleDays) || 28
    return lastPeriod.add(cycleLength, "days").format("YYYY-MM-DD")
  }

  const getFertilityWindow = () => {
    const nextPeriod = moment(getNextPeriodDate())
    const fertileStart = moment(nextPeriod).subtract(16, "days")
    const fertileEnd = moment(nextPeriod).subtract(12, "days")

    return {
      start: fertileStart.format("YYYY-MM-DD"),
      end: fertileEnd.format("YYYY-MM-DD"),
    }
  }

  const isInPeriod = () => {
    const today = moment()
    const periodStart = moment(userData.lastPeriodStart)
    const periodEnd = moment(userData.lastPeriodStart).add(Number.parseInt(userData.periodDays) || 5, "days")

    return today.isBetween(periodStart, periodEnd, "day", "[]")
  }

  const getPeriodStatus = () => {
    const today = moment()
    const lastPeriodStart = moment(userData.lastPeriodStart)
    const cycleLength = Number.parseInt(userData.cycleDays) || 28

    if (isInPeriod()) {
      const currentDay = today.diff(lastPeriodStart, "days") + 1
      return {
        isOnPeriod: true,
        message: `Period day ${currentDay}`,
        daysCount: currentDay,
      }
    }

    const nextPeriodDate = moment(lastPeriodStart)
    while (nextPeriodDate.isSameOrBefore(today)) {
      nextPeriodDate.add(cycleLength, "days")
    }

    const daysToNext = nextPeriodDate.diff(today, "days")
    return {
      isOnPeriod: false,
      message: `days until\nnext period`,
      daysCount: daysToNext,
    }
  }

  const getActiveDatesForMonth = (month) => {
    const activeDates = []
    const lastPeriodStart = moment(userData.lastPeriodStart)
    const cycleLength = Number.parseInt(userData.cycleDays) || 28
    const periodLength = Number.parseInt(userData.periodDays) || 5
    const currentCycleStart = moment(lastPeriodStart)

    currentCycleStart.subtract(2, "months")

    while (currentCycleStart.isBefore(moment().add(6, "months"))) {
      if (currentCycleStart.isSame(month, "month")) {
        for (let i = 0; i < periodLength; i++) {
          const periodDate = moment(currentCycleStart).add(i, "days")
          if (periodDate.isSame(month, "month")) {
            activeDates.push({
              day: periodDate.date(),
              type: "period",
            })
          }
        }

        const nextPeriodStart = moment(currentCycleStart).add(cycleLength, "days")
        const fertileStart = moment(nextPeriodStart).subtract(16, "days")
        const fertileEnd = moment(nextPeriodStart).subtract(12, "days")

        if (fertileStart.isSame(month, "month") || fertileEnd.isSame(month, "month")) {
          for (let date = moment(fertileStart); date.isSameOrBefore(fertileEnd); date.add(1, "day")) {
            if (date.isSame(month, "month")) {
              activeDates.push({
                day: date.date(),
                type: "fertile",
              })
            }
          }
        }
      }
      currentCycleStart.add(cycleLength, "days")
    }

    return activeDates
  }

  const getCurrentPhase = () => {
    const today = moment()
    const lastPeriodStart = moment(userData.lastPeriodStart)
    const cycleLength = Number.parseInt(userData.cycleDays) || 28
    const periodLength = Number.parseInt(userData.periodDays) || 5

    const currentCycleStart = moment(lastPeriodStart)
    while (currentCycleStart.add(cycleLength, "days").isAfter(today)) {
      currentCycleStart.subtract(cycleLength, "days")
    }

    const dayInCycle = today.diff(currentCycleStart, "days") + 1

    if (dayInCycle <= periodLength) return { name: "Menstrual Phase", color: "#FF4D6D" }
    if (dayInCycle < cycleLength * 0.3) return { name: "Follicular Phase", color: "#C77DFF" }
    if (dayInCycle < cycleLength * 0.5) return { name: "Ovulation Phase", color: "#FFD166" }
    return { name: "Luteal Phase", color: "#F8A978" }
  }

  return (
    <UserContext.Provider
      value={{
        userData,
        updateUserData,
        login,
        logout,
        getNextPeriodDate,
        getFertilityWindow,
        isInPeriod,
        getPeriodStatus,
        getActiveDatesForMonth,
        getCurrentPhase,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export default UserContext

