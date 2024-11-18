"use client";

import { addFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { FC, useState } from "react";
import Button from "./Button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>;

// We'll handle user input using react hook forms

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  // this is state for showing something to the user on succesful addition of friend
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);

  // We are overriding this FormData generic so as to infer types from the zod validator, as it originally isn't a TypeScript type, this will allow the useForm to expect in this case the email of type string from the user

  // Giving the useForm the FormData Generic is going to allow us register these input field and turning them into controlled components
  const {
    // We can destructure this register property that useForm provides us, and assign it to our input field for validation
    register,
    handleSubmit, // prevents default and i also can pass in a function
    setError, // very useful to get type of error against our zod validation or any field inside our zod schema
    formState: { errors }, // this is to get acces to error to diplay messages
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  const addFriend = async (email: string) => {
    try {
      // If the user gives out wrong input, we should make sure that they can't make a request, using zod for input validation
      const validatedEmail = addFriendValidator.parse({email});

      await axios.post("/api/friends/add", {
        email: validatedEmail,
      });

      setShowSuccessState(true);
    } catch (error) {
      // Since in case response other than 200, we don't know what error might be there , but we do know that it would be an instance of the class
      if (error instanceof z.ZodError) {
        // since the error is of type zod error we know it will come with a message (error.message)
        setError("email", { message: error.message });

        return;
      }

      if (error instanceof AxiosError) {
        // setting it optional in case the error comes with no response from axios
        setError("email", { message: error.response?.data });
        return;
      }

      setError("email", { message: "Something went wrong. 😖" });
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm bg-pink-400">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900 bg-orange-400"
      >
        Add friend by E-Mail
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-grey-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-grey-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="YourEmail@example.com"
          name=""
          id=""
        />
        {/* This button is gonna be of type submit by defualt cause its inside a form */}
        <Button>Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>

      {showSuccessState ? (
        <p className="mt-1 text-sm text-green-600">Friend Request Sent 😃</p>
      ) : null}
    </form>
  );
};

export default AddFriendButton;
